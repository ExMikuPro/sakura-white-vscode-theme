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
