// C# · attributes, generics and properties
using System;
using System.Collections.Generic;
[Serializable]
public class Blossom<T> {
    public T Name { get; init; }
    public int Petals { get; init; } = 5;
    public string Bloom() => $"Sakura: {Name}";
}
public static class Garden {
    public static void Main() {
        var flower = new Blossom<string> { Name = "Cherry" };
        Console.WriteLine(flower.Bloom());
    }
}
