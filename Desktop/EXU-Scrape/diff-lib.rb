module DiffLib
    ATTR_CHECKS = [
        "name",
        "effect",
        "pendulum_effect",
        "attribute",
        "scale",
        "atk",
        "def",
        "monster_color",
        "level",
        "arrows",
        "card_type",
        "ability",
        "custom",
        "type",
    ]
    
    DIFF_CHECKS = [
        "effect", "pendulum_effect"
    ]
    
    def self.string_normalize(s)
        s.to_s.gsub(/[\r\n\t]/, "")
    end

    def self.approximately_equal?(a, b)
        if String === a
            a = string_normalize a
            b = string_normalize b
        end
        a == b
    end
end
