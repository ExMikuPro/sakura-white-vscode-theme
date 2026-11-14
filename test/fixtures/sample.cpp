// C++ · templates, attributes and methods
#include <string>
template <typename T>
class Blossom {
public:
    T name;
    int petals = 5;
    [[nodiscard]] std::string bloom() const {
        return "Sakura: " + name;
    }
};
int main() {
    Blossom<std::string> flower{"Cherry"};
    return flower.bloom().empty();
}

namespace garden {
enum class Season { Spring = 1 };
}
