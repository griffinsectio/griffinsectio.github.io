+++
date = '2026-02-20T03:06:19+07:00'
draft = true
title = 'I/O Structures'
+++
The following is how the `_IO_FILE` struct constructed along with the offset for each field:
```c
struct _IO_FILE
{
    /* 0x00 */ char                 *_flags;
    /* 0x08 */ char                 *_IO_read_ptr;
    /* 0x10 */ char                 *_IO_read_end;
    /* 0x18 */ char                 *_IO_read_base;
    /* 0x20 */ char                 *_IO_write_base;
    /* 0x28 */ char                 *_IO_write_ptr;
    /* 0x30 */ char                 *_IO_write_end;
    /* 0x38 */ char                 *_IO_buf_base;
    /* 0x40 */ char                 *_IO_buf_end;
    /* 0x48 */ char                 *_IO_save_base;
    /* 0x50 */ char                 *_IO_backup_base;
    /* 0x58 */ char                 *_IO_save_end;
    /* 0x60 */ struct _IO_marker    *_markers;
    /* 0x68 */ struct _IO_FILE      *_chain;
    /* 0x70 */ int                  _fileno;
    /* 0x74 */ int                  _flags2;
    /* 0x78 */ _off_t               _old_offset;
    /* 0x80 */ unsigned short       _cur_column;
    /* 0x82 */ signed char          _vtable_offset;
    /* 0x83 */ char                 _shortbuf[1];
    /* 0x88 */ _IO_lock_t           _lock;
    /* 0x90 */ __off64_t            _offset;
    /* 0x98 */ struct _IO_codecvt   _codecvt;
    /* 0xa0 */ struct _IO_wide_data _wide_data;
    /* 0xa8 */ struct _IO_FILE      _freeres_list;
    /* 0xb0 */ void                 *_freeres_buf;
    /* 0xb8 */ size_t               __pad5;
    /* 0xc0 */ int                  _mode;
    /* 0xc4 */ char                 _unused2[20];
```
`_IO_FILE_plus` is just `_IO_FILE` struct with `vtable` field:
```c
struct _IO_FILE_complete
{
    /* 0x00 */ char                     *_flags;
    /* 0x08 */ char                     *_IO_read_ptr;
    /* 0x10 */ char                     *_IO_read_end;
    /* 0x18 */ char                     *_IO_read_base;
    /* 0x20 */ char                     *_IO_write_base;
    /* 0x28 */ char                     *_IO_write_ptr;
    /* 0x30 */ char                     *_IO_write_end;
    /* 0x38 */ char                     *_IO_buf_base;
    /* 0x40 */ char                     *_IO_buf_end;
    /* 0x48 */ char                     *_IO_save_base;
    /* 0x50 */ char                     *_IO_backup_base;
    /* 0x58 */ char                     *_IO_save_end;
    /* 0x60 */ struct _IO_marker        *_markers;
    /* 0x68 */ struct _IO_FILE          *_chain;
    /* 0x70 */ int                      _fileno;
    /* 0x74 */ int                      _flags2;
    /* 0x78 */ _off_t                   _old_offset;
    /* 0x80 */ unsigned short           _cur_column;
    /* 0x82 */ signed char              _vtable_offset;
    /* 0x83 */ char                     _shortbuf[1];
    /* 0x88 */ _IO_lock_t               _lock;
    /* 0x90 */ __off64_t                _offset;
    /* 0x98 */ struct _IO_codecvt       _codecvt;
    /* 0xa0 */ struct _IO_wide_data     _wide_data;
    /* 0xa8 */ struct _IO_FILE          _freeres_list;
    /* 0xb0 */ void                     *_freeres_buf;
    /* 0xb8 */ size_t                   __pad5;
    /* 0xc0 */ int                      _mode;
    /* 0xc4 */ char                     _unused2[20];
    /* 0xd8 */ const struct _IO_jump_t  *vtable;
```
`_IO_wide_data` struct is for dealing with multi-byte file stream:
```c
struct _IO_wide_data
{
    /* 0x00 */  wchar_t                   *_IO_read_ptr;
    /* 0x08 */  wchar_t                   *_IO_read_end;
    /* 0x10 */  wchar_t                   *_IO_read_base;
    /* 0x18 */  wchar_t                   *_IO_write_base;
    /* 0x20 */  wchar_t                   *_IO_write_ptr;
    /* 0x28 */  wchar_t                   *_IO_write_end;
    /* 0x30 */  wchar_t                   *_IO_buf_base;
    /* 0x38 */  wchar_t                   *_IO_buf_end;

    /* 0x40 */  wchar_t                   *_IO_save_base;
    /* 0x48 */  wchar_t                   *_IO_backup_base;
    /* 0x50 */  wchar_t                   *_IO_save_end;

    /* 0x58 */  __mbstate_t               _IO_state;
    /* 0x60 */  __mbstate_t               _IO_last_state;
    /* 0x68 */  struct _IO_codecvt        _codecvt;

    /* 0xd8 */  wchar_t                   _shortbuf[1];

    /* 0xe0 */  const struct _IO_jump_t   *_wide_vtable;
};

```
