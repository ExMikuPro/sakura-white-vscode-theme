// C · macros, structs and functions
#include <stdio.h>
#define PETALS 5
typedef struct Blossom {
    const char *name;
    int petals;
} Blossom;
static void bloom(const Blossom *flower) {
    printf("Sakura: %s (%d)\n", flower->name, flower->petals);
}
int main(void) {
    Blossom flower = {"Cherry", PETALS};
    bloom(&flower);
    return 0;
}
