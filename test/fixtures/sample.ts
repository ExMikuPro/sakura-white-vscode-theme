// Sakura White: cream, berry and soft purple
interface Blossom {
    readonly name: string;
    petals: number;
}

function bloom(flower: Blossom): string {
    const message = "Sakura";
    return `${message}: ${flower.name}`;
}

const flower: Blossom = { name: "Cherry", petals: 5 };
console.log(bloom(flower));

// Property completion: name and petals
flower.name;

const typedPetals: number = 5;
const settings = { label: "Sakura", petals: 5 };
