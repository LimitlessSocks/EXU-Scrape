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

$comb_deck_header = <<EOF
(function(obj) {
    window.scrapeReady = false;
    let promises = [];
    for(let [name, fn] of Object.entries(obj)) {
        promises.push(new Promise((resolve, reject) => {
            window[name] = function() {
                let res = fn();
                resolve();
                return res;
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
        let error = false;
        try {
            let message = document.getElementById("msg");
            error = message.children[1].textContent === "Deck does not exist";
        }
        catch(e) {
            // pass
        }
        return {
            success: false,
            error: error,
        };
    }
    let results = [];
    for(let a of [deck_arr, side_arr, extra_arr].flat()) {
        let { width, height } = a.find("img.pic").css(["width", "height"]);
        let data = a.data();
        let src = data.custom > 0 ? CUSTOM_PICS_START : CARD_IMAGES_START;
        let id = data.id;
        let idMod = id - id % 100000;
        src += idMod + "/" + id + ".jpg" + (data.pic != "1" ? "?version=" + a.pic : "");
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
    results = loop do
        data = $session.evaluate_script $comb_deck_fn
        break data["results"] if data["success"]
        if data["error"]
            puts "Deck with id #{id} not found, moving on"
            break []
        end
    end
    results
end

decks = [
    4327693, #Lacrimosa
    4367824, #Death Aspects
    4376011, #Combat Mechs
    4251928, #Traptrix Support
    4523067, #Voltron
    4385932, #Starbaric Crystal Beasts
    4540185, #Emeraheart
    4757288, #Pandas
    3180755, #Earthbound Prisoners
    4861946, #Poppin 1
    5003800, #Poppin 2
    4547335, #Titanus
    4570517, #Harbinger
    4910893, #Aria Fey
    4327992, #Serpenteam
    # 3820609, #Amphibious Bugroth
    # 3669535, #Fundamental Dragons
    # 4670325, #Blitzers
    5132465, #Esper V
    2788655, #Ravager
    5075635, #Starships
    5176216, #Antiqua
    4624534, #Harokai
    5183280, #Titan Hunter
    5256943, #Vampop☆Star
    4442461, #Titanic Dragon
    4604736, #of the North
    5269100, #Orb Magician
    4460492, #Holifear
    5323883, #Digitallias
    4659249, #Malevolessence
    5145725, #Remnant
    5297494, #Thunderclap
    4657652, #Elixstar/Potions
    5416935, #Akatsuki
    5304027, #Pyre
    5372415, #Modernotes
    # 4374978, #Insidious
    4415708, #Tensor Maidens
    4148322, #Dragonewts
    5089829, #Grand Knight
    5408141, #Amorel
    5396113, #Terra Basilisk
    5490132, #Sunavalon
    5187975, #Rulers of Name
    4868725, #Dominus
    5541864, #Kuroshiro
    5610680, #P@rol
    5597068, #Goo-T
    5576395, #Heaven-Knights
    5582929, #Seafolk
    4399429, #Hakaishin Archfiend
    5592020, #Bound
    4188326, #Anti-Luminescent Knights
    4933305, #Coccoon Support
    4936132, #F.A. Support
    4894268, #Kaiju Support
    5177132, #Darklord Support
    5336647, #Trickstar Support
    5219266, #Phantom Beast Support
    5260210, #Sylvan Support
    # 5549851, #Time Thief Support
    # 5549841, #Ghostrick Support
    # 5549769, #Danger! Support
    # 5577804, #Thunder Dragon Support
    4540980, #Vampire Support
    4780879, #Dinosaur Support
    4298315, #Nordic Support
    4073173, #Fabled Support
    # 4750943, #Ice Barrier Support
    # 5577782, #Dragonmaid Support
    # 5577790, #Zefra Support
    4390839, #Ancient Gear Support
    5515496, #Majestic Support
    4810529, #Blue-eyes Support
    5496883, #Vanilla Pendulum Support
    # 5637873, #Dhakira
    5643273, #Itayin
    4359326, #Eldertech
    4050998, #Mage & Spell Tomes
    5659403, #X-Saber Support
    5615949, #Alchemaster
    5647560, #Ophion
    5642481, #Daemon Engine
    5646060, #Ignation
    5627288, #Titanus Support
    4395391, #Trapod
    5593625, #Orb Magicians
    5549562, #Travelsha
    5668288, #Volcanic Support
    5687011, #Graydle Support
    5713213, #Sky Striker Support
    5705030, #Phantasm Spiral Support
    4177191, #Lightray Support
    5415163, #U.A. Support
    5685303, #Resonator Support
    4804758, #Draconia Support
    5663187, #Ploceress
    4950743, #Cyber Dragon Support
    5683010, #Pendulum Gods
    5717718, #Pixel Monsters
    5720993, #Watt Support
    5715247, #Crystron Support
    5713627, #Yeet
    # 4927027, #Wolvies
    5109480, #Kyudo
    5194131, #Fur Hire Support
    5720588, #Hungry Burger
    4337568, #Dreadator
    5737230, #Siamese Turtles
    5619459, #ANIMA
    # 4410756, #Kuriboh Support
    5733772, #Aurellia
    5601607, #Chaos Performer
    5744520, #Dream Mirror Support
    5751277, #World Legacy Support (Krawler)
    5274505, #Mayakashi Support
    5691370, #GRECO
    5755617, #Shagdi
    5741889, #Titanus Support
    5767298, #Holifear Support
    5270321, #Apocrypha
    4963487, #Battletech
    5782891, #The Weather Support
    5758077, #Faust
    5813034, #Gimmick Puppet Support
    5844326, #Danger! Support
    5432255, #Zefra Support
    4871988, #Dragonmaid Support
    4813673, #Thunder Dragon Support
    5844374, #Ghostrick Support
    5844363, #Time Thief Support
    3256281, #B.E.S. Support
    5010437, #Ugrovs
] + [
    5812210, #Generic Monsters I
    5812212, #Generic Monsters II
    5812213, #Generic Monsters III
    5812214, #Generic Spells
    5812216, #Generic Traps
    5812417, #Assorted TCG Single Support
]

deck_count = decks.size

def progress(i, deck_count)
    max_size = 20
    ratio = i * max_size / deck_count
    bar = ("#" * ratio).ljust max_size
    print "#{i}/#{deck_count} [#{bar}]\r"
end

# if VALID_OPERATIONS
database = {}
counts = Hash.new 0
decks.each.with_index(1) { |id, i|
    comb_deck(id).each { |card|
        id = card["id"]
        database[id] = card
        counts[id] += 1
    }
    progress i, deck_count
}
# puts database
File.write "db.json", database.to_json
finish = Time.now

puts "Time elapsed: #{finish - start}s"

STDIN.gets


