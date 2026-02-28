+++
date = '2026-02-20T02:58:03+07:00'
draft = true
title = 'Level20'
+++
The binary given for this challenge is very similar as for level 19. The following is the `checksec` test for it:
```bash
┌[s3cryph@arch]-(~/pwncollege/fsop/level20)
└> checksec --file babyfile_level20
[*] '/home/s3cryph/pwncollege/fsop/level20/babyfile_level20'
    Arch:       amd64-64-little
    RELRO:      Full RELRO
    Stack:      Canary found
    NX:         NX enabled
    PIE:        No PIE (0x400000)
    SHSTK:      Enabled
    IBT:        Enabled
    Stripped:   No
```
Again this binary has no PIE enabled and anything else enabled.
