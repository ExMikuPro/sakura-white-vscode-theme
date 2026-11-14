# Sakura
def greet(name: str) -> str:
    return "Sakura"


# Classes and properties
class Blossom:
    def __init__(
        self, name: str,
        petals: int = 5
    ):
        self.name = name
        self.petals = petals

    @property
    def label(self) -> str:
        return f"{self.name}"


flower = Blossom("Cherry")
print(flower.label)
