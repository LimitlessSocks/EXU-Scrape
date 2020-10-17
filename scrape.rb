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

$comb_deck_header = File.read("comb/deck_header.js")

$comb_deck_fn = File.read("comb/deck_fn.js")

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
    # 3180755, #Earthbound Prisoners
    4861946, #Poppin 1
    5003800, #Poppin 2
    4547335, #Titanus
    4570517, #Harbinger
    4910893, #Aria Fey
    # 4327992, #Serpenteam
    # 3820609, #Amphibious Bugroth
    # 3669535, #Fundamental Dragons
    # 4670325, #Blitzers
    # 5132465, #Esper V
    2788655, #Ravager
    5075635, #Starships
    # 5176216, #Antiqua
    4624534, #Harokai
    # 5189158, #Harokai
    # 5183280, #Titan Hunter
    # 5256943, #Vampop☆Star
    4442461, #Titanic Dragon
    4604736, #of the North
    # 5269100, #Orb Magician
    4460492, #Holifear
    5323883, #Digitallias
    # 4659249, #Malevolessence
    # 5145725, #Remnant
    # 5297494, #Thunderclap
    # 4657652, #Elixstar/Potions
    5416935, #Akatsuki
    5304027, #Pyre
    5372415, #Modernotes
    # 4374978, #Insidious
    # 4415708, #Tensor Maidens
    # 4148322, #Dragonewts
    # 5089829, #Grand Knight
    # 5408141, #Amorel
    5396113, #Terra Basilisk
    # 5490132, #Sunavalon
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
    # 4188326, #Anti-Luminescent Knights
    # 4933305, #Cocoon Support
    4936132, #F.A. Support
    4894268, #Kaiju Support
    5177132, #Darklord Support
    # 5336647, #Trickstar Support
    5219266, #Phantom Beast Support
    5260210, #Sylvan Support
    # 5549851, #Time Thief Support
    # 5549841, #Ghostrick Support
    # 5549769, #Danger! Support
    # 5577804, #Thunder Dragon Support
    # 4540980, #Vampire Support
    # 4780879, #Dinosaur Support
    # 4298315, #Nordic Support
    # 4073173, #Fabled Support
    # 4750943, #Ice Barrier Support
    # 5577782, #Dragonmaid Support
    # 5577790, #Zefra Support
    # 4390839, #Ancient Gear Support
    # 5515496, #Majestic Support
    4810529, #Blue-eyes Support
    5496883, #Vanilla Pendulum Support
    # 5637873, #Dhakira
    # 5643273, #Itayin
    4359326, #Eldertech
    4050998, #Mage & Spell Tomes
    5659403, #X-Saber Support
    5615949, #Alchemaster
    # 5647560, #Ophion
    5642481, #Daemon Engine
    # 5646060, #Ignation
    5627288, #Titanus Support
    # 4395391, #Trapod
    # 5593625, #Orb Magicians
    5549562, #Travelsha
    5668288, #Volcanic Support
    # 5687011, #Graydle Support
    # 5713213, #Sky Striker Support
    5705030, #Phantasm Spiral Support
    4177191, #Lightray Support
    # 5415163, #U.A. Support
    # 5685303, #Resonator Support
    4804758, #Draconia Support
    # 5663187, #Ploceress
    # 4950743, #Cyber Dragon Support
    5683010, #Pendulum Gods
    5717718, #Pixel Monsters
    5720993, #Watt Support
    # 5715247, #Crystron Support
    5713627, #Yeet
    # 4927027, #Wolvies
    5109480, #Kyudo
    5194131, #Fur Hire Support
    # 5720588, #Hungry Burger
    4337568, #Dreadator
    # 5737230, #Siamese Turtles
    5619459, #ANIMA
    # 4410756, #Kuriboh Support
    # 5733772, #Aurellia
    5601607, #Chaos Performer
    5744520, #Dream Mirror Support
    5751277, #World Legacy Support (Krawler)
    # 5274505, #Mayakashi Support
    # 5691370, #GRECO
    # 5755617, #Shangdi
    5741889, #Titanus Support
    # 5767298, #Holifear Support
    5270321, #Apocrypha
    4963487, #Battletech
    5782891, #The Weather Support
    5895706, #Faust
    5813034, #Gimmick Puppet Support
    # 5844326, #Danger! Support
    # 5432255, #Zefra Support
    # 4871988, #Dragonmaid Support
    # 4813673, #Thunder Dragon Support
    5844374, #Ghostrick Support
    # 5844363, #Time Thief Support
    # 5010437, #Ugrovs
    3256281, #B.E.S. Support
    5675322, #Kojoten
    4960158, #Skafos
    # 5772283, #Ascension Sky
    # 5837794, #Machina Support
    # 5813169, #Tanticore
    # 5856439, #Might of Valhalla
    5860710, #Uwumancer
    5749949, #Ancient Warrior Support
    5541683, #Hydrovenal
    # 5841822, #Tomes & Fate
    # 5877005, #Destruction Military Garrison (DMG)
    5894044, #Shino Support
    # 5873653, #Nether
    5766412, #Karmasattva
    # 5907048, #Elementsaber Support
    5834507, #Nadiupant
    4806770, #Chronotiger
    # 4383650, #BOOM! Mechs
    # 5907001, #Battlewasp Support
    # 5145725, #Remnant
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
    # 5518399, #Darkgnis
    6000654, #Laval Support
    4608663, #Time Thief Support
    4501871, #Oni Assassins
    # 5934147, #Neo Delta
    6050332, #Nermusa
    # 6014002, #Cipher Support
    6078350, #Majecore
    5869257, #Yova
    6109070, #Normal Support
    # 6129587, #Tindangle Support
    5098946, #Guildimension
    6044732, #Armorizer
    # 5936334, #Darkwater
    # 6162086, #Magnet Warrior Support
    5904696, #Contraptions
    # 4349406, #Franknstech
    6169009, #Aquaactress Support
    6044655, #Vampop☆Star
    6135219, #The Parallel
    # 6155436, #Insomnia
    # 3689114, #LeSpookie
    # 6111199, #Insectum
    6209092, #Acrimonic
    5703615, #World Chalice
    # 5830740, #New Order
    5884678, #Arsenal
    6221979, #Tindangle Support
    # 6173753, #Lurid
    6065677, #Artifact Support
    6121762, #Hydromunculus
    # 6239335, #Plorceress Support
    6239411, #Prank-Kids Support
    6236137, #Tacticore
    6233896, #Mirror Force Legacy Support/Archetype
    4667428, #Xiuhqui
    6245917, #Marincess Support
    6040042, #Kuuroma
    6116920, #Frozen
    5954949, #Ani's Yokai Stuff
    6247363, #Rowa - Elusive Power
    6163866, #Black Blood
    6227419, #Deep Burrower
    3080272, #Nightshade
    6086340, #Zeniphyr
    6267789, #Armamemento
    6292623, #Ninja Support
    # 6252579, #"Big" Game Hunter
    # 6308672, #Darkwater Support
    # 6291306, #Galaxieve
    6262300, #Muntu
    # 6255607, #Titan Hunter
    # 5663187, #Plorceress
    5297494, #Thunderclap
    6294677, #Diabolition
    # 6307561, #Crypt
    6334551, #Wild Hunt
    # 6135922, #TUBA
    6359238, #Galaxieve
    6359389, #New Order
    # 5412159, #FishurANT
    6360689, #Digital Bug Support
    6124612, #Metaphys Support
    6365184, #Nephthys Support
    4237940, #Taida
    4769548, #Empyreal
    6407622, #Chemicritter Support
    6412740, #Megalith Support
    6402157, #D/D/D Support
    5647256, #Meterao
    6412660, #Umbral Horror/Numbers 43, 65, 80, and 96 Support
    6405675, #Dark Kingdom
    6438706, #Constellar/Tellarknight Support
    4382580, #Mythical Winged Beasts
    6450641, #Gimmick Puppet Support
    6450165, #Contraption Restoration Program
    6445470, #Red-Eyes Support
    6446977, #Tagteamer
    6434960, #World Reaper
    6256752, #Concept of Reality
    4361777, #Eviction
    # 6418747, #Prideful
    6347993, #Headhunter
    4026672, #Fushioh Richie Support
    5818764, #Firewild
    6460257, #Dark Arts
    5269100, #Orb Magician Refreshed
    5145725, #Remnant
    6524605, #Borrel/Rokket Support
    6537631, #Bucket Squad
    6477846, #Cosmic Primal
    6556030, #Gadget Support
    6549655, #Sock's Generic Pack X
    6567063, #Hero of the West w/Hero of the East Support Card
    6395566, #Submerzan
    6578295, #Crypt
    6585445, #PPDC
    6563112, #NTG
    6582550, #Darkwater
    6560628, #Charismatic
] + [
    6353294, #Generic Monsters I
    6353380, #Generic Monsters II
    6353400, #Generic Monsters III
    6353414, #Generic Monsters IV
    6353430, #Generic Spells
    6353449, #Generic Traps
    6353457, #Assorted TCG Single Support
    #6353465, #Staples
]

banlist = [
    6358712,          #Imported
    6358715,          #Unimported
    
    5895579,          #Retrains
    5855756, 5856014, #Forbidden
    5857248,          #Limited
    5857281,          #Semi-Limited
    5857285,          #Unlimited
]

alt_arts = [
    6523837, # Noodle's Alt Arts
    #TODO: alt art holder for 1856588, 1856605
]

test = [
    6254262
]

beta = [
    #prio
    6595941, #fusion
    #reg
]


EXU_BANNED      = { "exu_limit" => 0 }
EXU_LIMITED     = { "exu_limit" => 1 }
EXU_SEMILIMITED = { "exu_limit" => 2 }
EXU_UNLIMITED   = { "exu_limit" => 3 }
EXU_RETRAIN     = { "exu_limit" => 3, "exu_retrain" => true }
EXU_IMPORT      = { "exu_limit" => 3, "exu_import" => true }
EXU_NO_IMPORT   = { "exu_limit" => 0, "exu_ban_import" => true }
extra_info = {
    5895579 => EXU_RETRAIN,
    
    5855756 => EXU_BANNED,
    5856014 => EXU_BANNED,
    
    5857248 => EXU_LIMITED,
    
    5857281 => EXU_SEMILIMITED,
    
    5857285 => EXU_UNLIMITED,
    
    6358712 => EXU_IMPORT,
    
    6358715 => EXU_NO_IMPORT
}
extra_info_order = extra_info.keys.sort_by { |key| banlist.index key }

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

decks += extra_info_order unless ignore_banlist.include? operation

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
type_replace = /\(.*?This (?:card|monster)'s original Type is treated as (.+?) rather than (.+?)[,.].*?\)/
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
    "type",
]
log "main", "Started scraping"
changed_ids = []
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
        # if id == "11110"
            # p card
        # end
        
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
                    changed_ids << id
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
            end
            database[id]["submission_source"] ||= deck_id
        end
    }
    progress i, deck_count
    log deck_id, "Finished scraping."
}

removed_ids = []

old_database.each { |id, card|
    unless database[id]
        log "main", "note: [-] removed old card #{id} (#{card && card["name"]})"
        removed_ids << id
    end
}

finish = Time.now

log "main", "Time elapsed: #{finish - start}s"

log "interact", "Beginning interaction phase."

log "interact", "Changed ids: #{changed_ids}"

def get_option(opts)
    puts "=============================="
    finish = opts.delete :finish
    opts.each { |key, val|
        puts " #{key}) #{val}"
    }
    if finish
        puts "------------------------------"
        puts " ENTER) finish"
        opts[""] = true
    end
    puts "=============================="
    option = nil
    until opts.include? option
        unless option.nil?
            puts "Invalid option #{option.inspect}"
        end
        option = STDIN.gets.chomp
    end
    option
end

def display_key(obj)
    if String === obj
        puts obj.gsub(/^/m, "    ")
    else
        p obj
    end
end

new_database = database.dup

puts "=============================="
puts "DATABASE INTERACTION"
loop {
begin
    # puts "=============================="
    # puts " 1) Select card by id"
    # puts " X) Select card by deck source"
    # puts " X) Select card by pattern search"
    # puts "------------------------------"
    # puts " ENTER) finish"
    # puts "=============================="
    option = get_option(
        "i" => "Select card by [i]d",
        # "s" => "Select card by deck [s]ource",
        "p" => "Select card by [p]attern search",
        finish: true
    )
    if option.empty?
        log "interact", "Exiting interaction"
        break
    end
    log "interact", "Keypress: #{option.inspect}"
    case option
    when "p"
        puts "Target parameter (default: name):"
        parameter = STDIN.gets.chomp
        parameter = "name" if parameter.empty?
        
        puts "Input pattern (regular expression):"
        pattern = Regexp.new STDIN.gets.chomp, Regexp::IGNORECASE
        
        matches = []
        
        new_database.each { |key, value|
            if pattern === value[parameter]
                matches << value
            end
        }
        removed_ids.each { |rid|
            value = old_database[rid]
            if pattern === value[parameter]
                matches << value
            end
        }
        
        count = matches.size
        
        matches.each.with_index(1) { |match, i|
            puts "(#{i}/#{count}) #{match["id"]} #{match["name"]}"
            display_key match["effect"]
        }
        ids = matches.map { |match| match["id"].to_s }
        if count.zero?
            log "interact", "No cards found matching #{pattern.inspect}."
        else
            log "interact", "Found cards with ids #{ids}."
        
            operation = nil
            while operation.nil? or operation == "d"
                if operation == "d"
                    puts "Enter space-separated id(s):"
                    ids = STDIN.gets.chomp.split
                    matches.select! { |match| ids.include? match["id"] }
                    log "interact", "Removed from selection: #{ids}"
                end
                operation = get_option(
                    "r" => "[r]eject all changes (save old versions)",
                    "a" => "[a]ccept all changes (save new versions)",
                    "d" => "[d]elete id(s) from operation selection and re-prompt",
                    finish: true,
                )
                if operation.empty?
                    log "interact", "No action taken."
                end
            end
            
            case operation
            when "r"
                source_db = old_database
                log "interact", "Replacing ids with old version: #{ids}"
            when "a"
                source_db = new_database
                log "interact", "Replacing ids with new version: #{ids}"
            end
            
            if source_db
                ids.each { |id|
                    database[id] = source_db[id] || database[id]
                }
            end
        end
        
        
    when "i"
        puts "Input card id:"
        card_id = nil
        until old_database[card_id] or new_database[card_id]
            unless card_id.nil?
                puts "Invalid ID #{card_id.inspect}"
            end
            card_id = STDIN.gets.chomp
        end
        # puts card_id
        
        old_entry = old_database[card_id]
        new_entry = new_database[card_id]
        
        old_name = old_entry && old_entry["name"]
        new_name = new_entry && new_entry["name"]
        
        name = if old_name == new_name
            old_name
        else
            "#{old_name} / #{new_name}"
        end
        
        puts "== #{name} (#{card_id}) =="
        
        puts "Enter input parameter (or ENTER, to see entire hash):"
        parameter = STDIN.gets.chomp
        
        
        
        if old_entry == new_entry
            puts "No changes made to #{card_id} (#{name})"
        else
            puts ">> Old entry <<"
            old_value = old_entry && !parameter.empty? ? old_entry[parameter] : old_entry
            display_key old_value
            puts 
            
            puts ">> New entry <<"
            new_value = new_entry && !parameter.empty? ? new_entry[parameter] : new_entry
            display_key new_value
            puts
            
            old_or_new = get_option(
                "o" => "Replace with [o]ld entry",
                "n" => "Replace with [n]ew entry",
                "x" => "No action [x]",
            )
            
            if old_or_new == "o"
                database[card_id] = old_entry
                log "interact", "Saved old version of #{card_id} (#{name})"
            elsif old_or_new == "n"
                database[card_id] = new_entry
                log "interact", "Saved new version of #{card_id} (#{name})"
            else
                #no action
                log "interact", "No action taken"
            end
        
        end
        
        
    else
        log "interact", "Unrecognized input command."
    end
rescue Interrupt => e
    puts "Are you sure you want to exit interaction? ^C again to quit. ENTER to continue."
    begin
        STDIN.gets
    rescue Interrupt => e
        break
    end
end
}

puts "Press ENTER to confirm database entry."
STDIN.gets
$log_file.close
File.write "#{outname}.json", database.to_json
