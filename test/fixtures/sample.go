// Sakura
package main
func greet(name string) string {
    return "Sakura"
}

// Structs and methods
type Blossom struct {
    Name   string
    Petals int
}

func (b Blossom) Bloom() string {
    return greet(b.Name)
}

func main() {
    flower := Blossom{
        Name: "Cherry",
        Petals: 5,
    }
    println(flower.Bloom())
}
