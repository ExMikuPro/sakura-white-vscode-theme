// Java · annotations, generics and methods
import java.util.List;
final class Blossom<T> {
    private final T name;
    private final int petals = 5;
    Blossom(T name) { this.name = name; }
    @Override
    public String toString() {
        return "Sakura: " + name + " (" + petals + ")";
    }
    public static void main(String[] args) {
        var flower = new Blossom<String>("Cherry");
        System.out.println(flower);
    }
}

enum Season { SPRING, SUMMER }
