require 'json'

TYPES = %w(
    Omega\ Psychic
    High\ Dragon
    Celestial\ Warrior
    Magical\ Knight
    Sea\ Serpent
    Winged\ Beast
    Beast-Warrior
    Divine-Beast
    Aqua Beast Cyberse Cyborg Dinosaur Dragon Fairy Fiend Fish Galaxy Illusion Insect Machine Plant Psychic Pyro Reptile Rock Spellcaster Thunder Warrior Wyrm Zombie Yokai
)
TYPES_REG = Regexp.new TYPES.join "|"
ATTRIBUTES = %w(
    DARK DIVINE EARTH FIRE LIGHT WATER WIND
)
ATTRIBUTES_REG = Regexp.new ATTRIBUTES.join "|"
NAME_REGEX = /"((?:".*?")?(?: ".*?"|[^"])+|"[^"]+")"/

def normalize_card!(card)
    # TODO: use treated_as property?
    extra_types = []
    extra_attributes = []
    extra_names = []
    
    card["also_archetype"] ||= nil
    # TODO: fix date property for customs (format YYYY-MM-DD)
    card["date"] ||= card["tcg_date"] || nil
    card["exu_limit"] ||= card["tcg_limit"] || 3
    
    # TODO: original level?
    
    # also always
    if card["effect"] =~ /\(.*This card is also always treated as an?(.+?)(?:monster|card).*\)/
        extra_props = $1.dup
        
        extra_props.gsub!(TYPES_REG) {
            extra_types << $&
            ""
        }
        extra_props.gsub!(ATTRIBUTES_REG) {
            extra_attributes << $&
            ""
        }
        extra_props.gsub!(NAME_REGEX) {
            extra_names << $1
            ""
        }
        # puts card["name"], extra_props.inspect, { types: extra_types, attr: extra_attributes, name: extra_names }, "-" * 30
    end
    # type change
    if card["effect"] =~ /\(.*This (?:card|monster).?s original Type is treated as (.+?) rather than.*\)/
        card["type"] = $1
        # p card
    end
    # name always change
    if card["effect"] =~ /\(This (?:card|monster).?s name is always treated as "(.+?)".*\)/
        card["treated_as"] = $1
    end
    # name also always change
    if card["effect"] =~ /\(This (?:card|monster).?s name is also always treated as "(.+?)".*\)/
        extra_names << $1
    end
    
    # ensure pendulum effects are defined
    if card["pendulum"] != 0
        card["pendulum_effect"] ||= ""
    end
    
    # ensure src
    if card["custom"] and card["custom"] > 0
        idMod = card["id"].to_i
        idMod = idMod - idMod % 100000
        src = "https://www.duelingbook.com/images/custom-pics/#{idMod}/#{card["id"]}.jpg"
        if card["pic"] and card["pic"] != "1"
            src += "?version=" + card["pic"]
        end
        card["src"] ||= src
    else
        card["src"] ||= "https://www.duelingbook.com/images/low-res/#{card["id"]}.jpg"
    end
    
    # update accordingly
    # we join attributes/types by "/", but names by " "
    # this makes parsing out separate types/attributes easier, but does not introduce an unexpected artifact with also_archetype
    card["attribute"] = ([card["attribute"]] + extra_attributes).join "/"
    card["type"] = ([card["type"]] + extra_types).join "/"
    card["attribute_count"] = card["attribute"].count("/") + 1
    card["type_count"] = card["type"].count("/") + 1
    card["also_archetype"] = extra_names.join " "
end

data = JSON::parse File.read "unifiedComposite.json"
data.each { |card_id, card|
    normalize_card! card
}

# TODO: interact with alt arts?
banlist = JSON::parse File.read "banlist.json"

# sanity check for duplicates
places_occurred = {}
duplicate_ids = []

# Iterate through each banlist
%w(banned limited semi_limited unlimited).each { |list_name|
    ids = banlist[list_name]
    ids.each { |id|
        places_occurred[id] ||= []
        places_occurred[id] << list_name
        if places_occurred[id].size == 2
            # we only want to add the duplicate once, so == 2 is the first time we see a duplicate
            duplicate_ids << id
        end
    }
}

duplicate_ids.each { |id|
    puts "Warning: Card ID #{id} is duplicated in #{places_occurred[id] * "; "}"
}

banlist["banned"].each { |id| data[id.to_s]["exu_limit"] = 0 }
banlist["limited"].each { |id| data[id.to_s]["exu_limit"] = 1 }
banlist["semi_limited"].each { |id| data[id.to_s]["exu_limit"] = 2 }
banlist["unlimited"].each { |id| data[id.to_s]["exu_limit"] = 3 }

puts "Writing normalized results to db-tmp.json..."
File.write "db-tmp.json", data.to_json
