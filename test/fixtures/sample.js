// Sakura
function greet(name) {
    return "Sakura";
}

// Classes, methods and properties
class Blossom {
    constructor(name, petals = 5) {
        this.name = name;
        this.petals = petals;
    }

    bloom() {
        return `${greet(this.name)}: ${this.petals}`;
    }
}

const flower = new Blossom("Cherry");
console.log(flower.bloom());
