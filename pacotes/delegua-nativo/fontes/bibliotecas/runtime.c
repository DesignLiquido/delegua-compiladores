#include <stdio.h>
#include <stdlib.h>
#include <stdarg.h>
#include <string.h>

int escreva(const char *fmt, ...) {
    va_list args;
    va_start(args, fmt);
    int result = vprintf(fmt, args);
    va_end(args);
    return result;
}

char* leia(const char *prompt, char *buffer) {
    if (prompt) printf("%s", prompt);
    fflush(stdout);
    if (buffer == NULL) {
        buffer = (char*)malloc(1024);
    }
    if (fgets(buffer, 1024, stdin) != NULL) {
        size_t len = strlen(buffer);
        if (len > 0 && buffer[len - 1] == '\n') {
            buffer[len - 1] = '\0';
        }
    }
    return buffer;
}

int inteiro(const char *str) {
    return atoi(str);
}

double numero(const char *str) {
    return atof(str);
}

void falhar(const char *msg) {
    fprintf(stderr, "Erro: %s\n", msg);
    exit(1);
}
