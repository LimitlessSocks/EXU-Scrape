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
    3156058, #starless-knights
    4810529, #blue-eyes support
    4757288, #panda
    4746493, #servus
    3180755, #earthbound prisoners
    4137538, #necro outlaw
]
decks = [
    3156058, #Starless Knight
    4137538, #Necroutlaw
    4327693, #Lacrimosa
    4073173, #Fabled II
    4327347, #Devaliers
    4374978, #Insidious
    4367824, #Death Aspects
    3234334, #Chitinmera
    4376011, #Combat Mechs
    4229422, #Dreadful
    4251928, #Traptrix (Support)
    4436271, #Tsukumogami
    4298315, #Nordic (Support) - Might of Valhalla
    # 4484782, #Antiqua - ERROR DECK NOT FOUND
    4415708, #Tenor Maidens
    4608403, #Goo Transformation
    4395035, #Astral Dragons
    4540976, #Zoodiac Support
    4523067, #Voltron
    4617451, #Ordarim
    4385932, #Starbaric Crystal Beasts
    4540185, #Emereheart
    4759875, #Goo Transformation II
    4226313, #Arcane Armament
    3734721, #Carcharrack
    4810529, #Blue-Eyes Support
    4757288, #Pandas
    4746493, #Servus
    3180755, #Earthbound Prisoners
    4148322, #Dragonewts
    4861946, #Poppin
    4959967, #Ravager
    4963487, #Battletech
    4547335, #Titanus
    4466861, #Statues
    4570517, #Harbinger
    4904567, #Pyrodent
    5003800, #Poppin Wave 2
    4910893, #Aria Fey
    4933305, #Cocoon Support
    4327992, #Serpenteam
    4936132, #F.A Support
    4177191, #Lightray Support
] + [
    4905031, #Custom Support - EXU Decks
    4904905, #EXU Singles - Generic Monsters
    4849091, #EXU Singles - Generic Spells
    4904924, #EXU Singles - Generic Traps
    4904981, #Custom Support - TCG Decks
    
    5099556, #NOEDIT.1
]


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




