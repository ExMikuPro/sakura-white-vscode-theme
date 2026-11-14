// Sakura
fn greet(name: &str) -> String {
    format!("Sakura {}", name)
}

// Traits, generics and macros
#[derive(Debug)]
struct Blossom<T> {
    name: T,
    petals: u8,
}

fn main() {
    let flower = Blossom {
        name: "Cherry",
        petals: 5,
    };
    println!("{:?}", flower);
}
