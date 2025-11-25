+++
date = '2025-11-26T01:36:35+07:00'
draft = true
title = 'Test Post'
+++
## buffer overflow
```c
#include <stdio.h>
#include <unistd.h>

int main() {
    char buf[0x100];

    printf(">> ");
    read(0, buf, 0x1000);

    return 0;
}
```
