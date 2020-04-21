VALID_OPERATIONS = ["append", "refresh"]
operation = ARGV[0]


unless VALID_OPERATIONS.include? operation
    STDERR.puts "Expected an operation [append, refresh], got: #{operation.inspect}"
    exit 1
end

require 'capybara'
start = Time.now

# ids = [1231402, 1291692, 902755, 1318524, 1319058]
# ids.each { |id|
    # puts "Visiting page..."
    # session.visit("https://www.duelingbook.com/card?id=#{id}")
    # puts "Loaded!"

    # src = nil
    # loop do
        # src = session.evaluate_script '$(my_card[0]).find("img.pic").attr("src")'
        # break if src != "./images/black.jpg"
    # end
    # data = session.evaluate_script 'my_card.data()'
    # data["src"] = src
    # database[id] = data
    # puts data["name"] + " loaded."
# }
puts "Loading capybara..."
$session = Capybara::Session.new(:selenium)
puts "Loaded!"

deck_id = 4757288

$comb_deck_header = <<EOF
(function(obj) {
    let promises = [];
    for(let [name, fn] of Object.entries(obj)) {
        promises.push(new Promise((resolve, reject) => {
            window[name] = function() {
                fn();
                resolve();
            }
        }));
    }
    Promise.all(promises).then(() => {
        window.scrapeReady = true;
    });
})({ countMain: countMain, countSide: countSide, countExtra: countExtra });
EOF
    
$comb_deck_fn = <<EOF
(function() {
    if(!window.scrapeReady) {
        return {
            success: false
        };
    }
    let results = [];
    for(let a of [deck_arr, side_arr, extra_arr].flat()) {
        let { width, height } = a.find("img.pic").css(["width", "height"]);
        let data = a.data();
        let src = data.custom > 0 ? CUSTOM_PICS_START : CARD_IMAGES_START;
        src += data.id + ".jpg" + (data.pic != "1" ? "?version=" + a.pic : "");
        data.src = src;
        data.width = width;
        data.height = height;
        results.push(data);
    }
    return {
        success: true,
        results: results,
    }
})();
EOF

def comb_deck(id)
    $session.visit("https://www.duelingbook.com/deck?id=#{id}")
    $session.evaluate_script $comb_deck_header
    data = nil
    loop do
        data = $session.evaluate_script $comb_deck_fn
        break if data["success"]
    end
    results = data["results"]
end

decks = [
    # 3156058, #Starless Knight - UNAPPROVED?
    4137538, #Necroutlaw
    4327693, #Lacrimosa
    4073173, #Fabled II
    # 4327347, #Devaliers
    4374978, #Insidious
    4367824, #Death Aspects
    3234334, #Chitinmera
    4376011, #Combat Mechs
    # 4229422, #Dreadful
    4251928, #Traptrix (Support)
    4436271, #Tsukumogami
    4298315, #Nordic (Support) - Might of Valhalla
    # 4484782, #Antiqua - ERROR DECK NOT FOUND
    4415708, #Tensor Maidens
    4608403, #Goo Transformation
    # 4395035, #Astral Dragons
    # 4540976, #Zoodiac Support
    4523067, #Voltron
    4617451, #Ordarim
    4385932, #Starbaric Crystal Beasts
    4540185, #Emereheart    
    4759875, #Goo Transformation II
    4226313, #Arcane Armament
    3734721, #Carcharrack
    4810529, #Blue-Eyes Support
    4757288, #Pandas
    # 4746493, #Servus
    3180755, #Earthbound Prisoners
    4148322, #Dragonewts
    4861946, #Poppin
    4959967, #Ravager
    4963487, #Battletech
    4547335, #Titanus
    # 4466861, #Statues
    4570517, #Harbinger
    4904567, #Pyrodent
    5003800, #Poppin Wave 2
    4910893, #Aria Fey
    4933305, #Cocoon Support
    4327992, #Serpenteam
    4936132, #F.A Support
    4177191, #Lightray Support
    4894268, #Kaiju Support
    4991716, #Modernotes
    3669535, #Fundamental Dragons
    3820609, #Amphibious Bugroth
    5132465, #Esper V (MR5 Psychic Deck)
    5089829, #Grand Knight
    2788655, #Ravager (V2)
    5075635, #Starships
    5176216, #Antiqua (Updated Link)
    4624534, #Harokais
    5183280, #Titan Hunter
    5256943, #Vampop☆Star
    4442461, #Titanic Dragons
    4750943, #Ice Barrier Support
    4604736, #Of the North
    5269100, #Orb Magicians
    5177132, #Darklord Retrains
    5336647, #Trickstar Support
    5219266, #Phantom Beast Support
    4460492, #Holifear
    5323883, #Digitallias
    4659249, #Malevolessence
    4670325, #Blitzers
    5408141, #Amorel
    5145725, #Remnant
    5260210, #Sylvan Support
    5297494, #Thunderclap
] + [
    5180324, #Semi-Generic Monsters
    5179964, #Generic Monsters
    5179965, #Generic Spells
    5179966, #Generic Traps
    5179972, #TCG Support
    5179969, #Customs Support
]

# if VALID_OPERATIONS
database = {}
counts = Hash.new 0
decks.each { |id|
    comb_deck(id).each { |card|
        id = card["id"]
        database[id] = card
        counts[id] += 1
    }
}
puts database
File.write "db.json", database.to_json
finish = Time.now

puts "Time elapsed: #{finish - start}s"

STDIN.gets


