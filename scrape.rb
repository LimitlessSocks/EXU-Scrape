VALID_OPERATIONS = ["main", "banlist", "test", "beta"]
operation = ARGV[0]


unless VALID_OPERATIONS.include? operation
    STDERR.puts "Expected an operation [#{VALID_OPERATIONS * ", "}], got: #{operation.inspect}"
    exit 1
end

require 'capybara'
require 'json'
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
        if(data.custom > 0) {
            let idMod = id - id % 100000;
            src += idMod + "/";
        }
        src += id + ".jpg" + (data.pic != "1" ? "?version=" + a.pic : "");
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
            log id, "Deck with id #{id} not found, moving on"
            break []
        end
    end
    results
end

database = [
    5919456, #Lacrimosa
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
    # 4624534, #Harokai
    5189158, #Harokai
    # 5183280, #Titan Hunter
    # 5256943, #Vampop☆Star
    4442461, #Titanic Dragon
    4604736, #of the North
    5269100, #Orb Magician
    4460492, #Holifear
    5323883, #Digitallias
    # 4659249, #Malevolessence
    5145725, #Remnant
    # 5297494, #Thunderclap
    # 4657652, #Elixstar/Potions
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
    # 5610680, #P@rol
    6110085, #P@rol (Ani)
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
    # 4298315, #Nordic Support
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
    # 5647560, #Ophion
    5642481, #Daemon Engine
    5646060, #Ignation
    5627288, #Titanus Support
    # 4395391, #Trapod
    5593625, #Orb Magicians
    5549562, #Travelsha
    5668288, #Volcanic Support
    5687011, #Graydle Support
    # 5713213, #Sky Striker Support
    5705030, #Phantasm Spiral Support
    4177191, #Lightray Support
    # 5415163, #U.A. Support
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
    5895706, #Faust
    5813034, #Gimmick Puppet Support
    # 5844326, #Danger! Support
    5432255, #Zefra Support
    4871988, #Dragonmaid Support
    4813673, #Thunder Dragon Support
    5844374, #Ghostrick Support
    # 5844363, #Time Thief Support
    # 5010437, #Ugrovs
    3256281, #B.E.S. Support
    5675322, #Kojoten
    4960158, #Skafos
    5772283, #Ascension Sky
    5837794, #Machina Support
    5813169, #Tanticore
    5856439, #Might of Valhalla
    5860710, #Uwumancer
    5749949, #Ancient Warrior Support
    5541683, #Hydrovenal
    5841822, #Tomes & Fate
    5877005, #Destruction Military Garrison (DMG)
    5894044, #Shino Support
    5873653, #Nether
    5766412, #Karmasattva
    5903684, #Prank-Kids Support
    5907048, #Elementsaber Support
    5834507, #Nadiupant
    4806770, #Chronotiger
    4383650, #BOOM! Mechs
    5907001, #Battlewasp Support
    5145725, #Remnant
    5839316, #Duo-Attribute Support
    5587605, #Hot Pink
    5448052, #Modernotes 2: Idols and Icons
    4422086, #Mystrick Support
    5936560, #The Agent Support
    5917260, #Koala
    2788655, #Ravager
    5824862, #Titanic Moth
    5844326, #Danger! Support
    5925194, #Yurei
    5868144, #Tsurumashi
    5781120, #Stars
    5935151, #Shirakashi
    2952495, #Genjutsu
    5979832, #Raycor
    # 5008957, #Akuma
    # 4166948, #Fafner
    5518399, #Darkgnis
    6000654, #Laval Support
    4608663, #Time Thief Support
    4501871, #Oni Assassins
    5934147, #Neo Delta
    6050332, #Nermusa
    6014002, #Cipher Support
    6078350, #Majecore
    5869257, #Yova
    6109070, #Normal Support
    6129587, #Tindangle Support
    5098946, #Guildimension
    6044732, #Armorizer
    5936334, #Darkwater
    6162086, #Magnet Warrior Support
    5904696, #Contraptions
    4349406, #Franknstech
    6169009, #Aquaactress Support
    6044655, #Vampop☆Star
    6135219, #The Parallel
    6155436, #Insomnia
    3689114, #LeSpookie
] + [
    5812210, #Generic Monsters I
    5812212, #Generic Monsters II
    5812213, #Generic Monsters III
    5974796, #Generic Monsters IV
    5812214, #Generic Spells
    5812216, #Generic Traps
    5812417, #Assorted TCG Single Support
] + [
    #temp prio
    # 6063436, #Sock Generic I
    6082121, #Sock Generic II
    5932326, #Round 3 of Ani Generics (Generic Singles)
    5839353, #Wave 2 of Dual-Attribute Support
]

banlist = [
    5895579,          #Retrains
    5855756, 5856014, #Forbidden
    5857248,          #Limited
    5857281,          #Semi-Limited
    5857285           #Unlimited
]

test = [
    banlist[-1], 6192766
]

beta = [
    #prio
    6108874, #Set Ablaze
    6108307, #Gate Guardian Support
    6111199, #Insectum
    6135219, #The Parallel
    6099647, #(more) Magnet Warrior Support
    6163866, #Black blood
    6152840, #Neo Delta Support
    5615821, #Onomat/Utopia Support
    6176395, #BLAZE'S EXU SINGLES PACK (VERSION 3)
    3300698, #AL-Knight
    1744106, #The Daemon Void
    6116920, #Frozen _ Beyond the Ice Barrier
    #reg
    3689114, #LeSpookie
    6113749, #Cyber City
    4184071, #Banyugeni
    6155436, #Insomnia
    5830740, #New Order
    6156281, #FlavorFlov singles
    6163245, #KryMP
    6173753, #Lurid
]


EXU_BANNED      = { "exu_limit" => 0 }
EXU_LIMITED     = { "exu_limit" => 1 }
EXU_SEMILIMITED = { "exu_limit" => 2 }
EXU_UNLIMITED   = { "exu_limit" => 3 }
EXU_RETRAIN     = { "exu_limit" => 3, "exu_retrain" => true }
extra_info = {
    5895579 => EXU_RETRAIN,
    
    5855756 => EXU_BANNED,
    5856014 => EXU_BANNED,
    
    5857248 => EXU_LIMITED,
    
    5857281 => EXU_SEMILIMITED,
    
    5857285 => EXU_UNLIMITED,
}

decks = nil
outname = nil

if operation == "main"
    decks = database
    outname = "db"
elsif operation == "banlist"
    decks = banlist
    outname = "banlist"
elsif operation == "beta"
    decks = beta
    outname = "beta"
else
    decks = test
    outname = "test"
end

ignore_banlist = ["test", "beta"]

decks += extra_info.keys unless ignore_banlist.include? operation

decks.uniq!

deck_count = decks.size

def progress(i, deck_count)
    max_size = 20
    ratio = i * max_size / deck_count
    bar = ("#" * ratio).ljust max_size
    puts "#{i}/#{deck_count} [#{bar}]"
end

def string_normalize(s)
    s.gsub(/[\r\n\t]/, "")
end

def approximately_equal(a, b)
    if String === a
        a = string_normalize a
        b = string_normalize b
    end
    a == b
end

now_time_name = Time.now.strftime("log/#{outname}-%m-%d-%Y.%H.%M.%S.txt")

$log_file = File.open(now_time_name, "w:UTF-8")
def log(src, info)
    str = "[#{src}] #{info}"
    puts str.gsub(/\r/, "\n")
    $log_file.puts str if $log_file
end

log "main", "Created log file #{now_time_name}"

old_database = if File.exist? "#{outname}.json"
    file = File.open "#{outname}.json", "r:UTF-8"
    text = file.read
    file.close
    log "main", "Reading #{outname}.json"
    JSON.parse text
else
    log "main", "Creating new file #{outname}.json"
    {}
end
database = {}
counts = Hash.new 0
type_replace = /\(.*?This monster's original Type is treated as (.+?) rather than (.+?)[,.].*?\)/
archetype_treatment = /\(.*This card is always treated as an? "(.+?)" card.*\)/
attr_checks = [
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
]
log "main", "Started scraping"
decks.each.with_index(1) { |deck_id, i|
    info = extra_info[deck_id]
    log deck_id, "STARTING TO SCRAPE DECK #{deck_id}"
    comb_deck(deck_id).each { |card|
        id = card["id"].to_s
        unless info.nil?
            card.merge! info
        end
        if type_replace === card["effect"]
            card["type"] = $1
        end
        if archetype_treatment === card["effect"]
            card["also_archetype"] = $1
        else
            card["also_archetype"] = nil
        end
        
        # log operations
        display_text = "#{id} (#{card["name"]})"
        if database[id] and operation == "banlist"
            log deck_id, "warning: duplicate id #{display_text}"
        end
        if card["custom"] and card["custom"] > 1
            log deck_id, "warning: card id #{display_text} is not public"
        end
        if old_database[id]
            old_entry = old_database[id]
            attr_checks.each { |check|
                unless approximately_equal(old_entry[check], card[check])
                    if check == "custom"
                        mode = ["public", "private"][card[check] - 1]
                        log deck_id, "note: card id #{display_text} was made #{mode}"
                    else
                        log deck_id, "note: property '#{check}' of card id #{display_text} was changed"
                        log deck_id, "from: #{old_entry[check]}"
                        log deck_id, "to: #{card[check]}"
                    end
                end
            }
        else
            log deck_id, "note: [+] added new card #{display_text}"
        end
        
        database[id] ||= {}
        database[id].merge! card
        counts[id] += 1
        
        # not an extra archetype
        unless extra_info.include? deck_id
            if counts[id] > 1
                log deck_id, "warning: card id #{display_text} was duplicated in <#{deck_id}> from <#{database[id]["submission_source"]}>"
            else
                database[id]["submission_source"] = deck_id
            end
        end
    }
    progress i, deck_count
    log deck_id, "Finished scraping."
}

old_database.each { |id, card|
    unless database[id]
        log "main", "note: [-] removed old card #{id} (#{card["name"]})"
    end
}

finish = Time.now

log "main", "Time elapsed: #{finish - start}s"

$log_file.close
puts "Press ENTER to confirm database entry."
STDIN.gets
File.write "#{outname}.json", database.to_json
