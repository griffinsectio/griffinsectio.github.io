+++
date = '2025-11-26T01:52:08+07:00'
draft = false
title = 'Buffer Overflow'
+++
## Buffer overflow
Buffer overflow happen when the program storing data more than a buffer can handle causing the data to "overflow" to other part of the program and possibly overwriting program's data and give the attacker the ability to do arbitrary write bounded to how much data the program ask.
Below is a deliberately vulnerable to buffer overflow C program:
```c
#include <stdio.h>
#include <unistd.h>

int main() {
    char buf[0x100];

    printf(">> ");
    read(0, buf, 0x1000);

    return 0;
}
The above program will read from stdin for 0x1000 length of input and store it inside `buf` variable. Obviously the `buf` variable won't be able to store all the data cause it has been specified to contains 0x100 amount of data. The consequence of this seemingly trivial typo of adding additional 0 when asking user for input is arbitrary overwrite of data on the stack. Attacker can use this overflow to overwrite the data beyond the buf variable and possibly hijacking the program control flow by overwriting the return address of the function. 
