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
    # Support
    6787178, #Super Quant Support
    6774584, #Koa'ki Meiru Support
    6514931, #Dinomist Support
    6590945, #Constellar Support
    6746888, #Performapal Sky Magician & Odd-Eyes Support
    6708539, #Trickstar Support
    6787363, #Random TCG Archetypes Support
    6008240, #Summoned Skull Support
    6686412, #Paladin Ritual Support
    6628957, #Garzett Support
    6645825, #Yubel Support
    6622494, #Codebreaker Support
    6598859, #of the Dark Support
    6556030, #Boot-Up Gadget Support
    6524605, #Pure Borrel/Rokket Support
    6791911, #Kaiju Support
    4026672, #Fushioh Richie Support
    6791947, #Red-Eyes Support
    6450641, #Gimmick Puppet Support
    6438706, #Constellar/Tellarknight Support
    6412660, #Umbral Horror/Numbers 43, 65, 80, and 96 Support
    6402157, #D/D/D Support
    6412740, #Megalith Support
    6407622, #Chemicritter Support
    6365184, #Nephthys Support
    6124612, #Metaphys Support
    6360689, #Digital Bug Support
    6292623, #Ninja Support
    6245917, #Marincess Support
    5954949, #Yokai Support
    5703615, #World Chalice/World Legacy Support
    6169009, #Aquaactress Support
    6109070, #Normal Monster Support
    6000654, #Laval Support
    5844326, #Danger! Support
    5936560, #The Agent Support
    4422086, #Mystrick Support
    5839316, #Duo-Attribute Support
    6239411, #Prank-Kids Support
    5894044, #Shino Support
    5749949, #Ancient Warriors Support
    4251928, #Traptrix Support
    4936132, #F.A. Support
    5177132, #Darklord Support
    5219266, #Phantom Beast Support
    5260210, #Sylvan Support
    4810529, #Blue-Eyes Support
    5496883, #Normal Pendulum Support
    3256281, #B.E.S. Support
    5782891, #The Weather Support
    5194131, #Fur Hire Support
    5720993, #Watt Support
    4804758, #Draconia Support
    4177191, #Lightray Support
    5705030, #Phantasm Spiral Support
    5668288, #Volcanic Support
    5741889, #Titanus Support
    5659403, #X-Saber Support
    5751277, #Krawler Support
    5744520, #Dream Mirror Support
    6771198, #Vendread Support
    2775342, #Triamid Support
    6785116, #Legendary Dragon, Fairy Tail, Dark World & Shiranui Support
    6787972, #Orb Magician Support
    6792668, #Jurrac Support
    6792679, #Cyber Dragon Support
    6793309, #Subterror Behemoth Support
    6793437, #Artifact Support
    6793424, #Time Thief Support
    6771472, #Vendread Support
    6794841, #Alien Support
    6798989, #D.D. Support
    6807794, #Hydrovenal Support
    6804358, #Amorphage Support
    6804350, #Cipher Support
    6804345, #Cyberdark Support
    6804341, #Bujin Support
    6780728, #Hieratic Support
    4493192, #Meklord Support
    6801590, #Earthbound Support
    6858396, #Mayakashi Support
    6858407, #Graydle Support
    
    # Archetypes
    # 4327693, #Lacrimosa
    4367824, #Death Aspects
    4376011, #Combat Mechs
    4523067, #Voltron
    4385932, #Starbaric Crystal Beasts
    4540185, #Emeraheart
    4757288, #Pandas
    4861946, #Poppin
    4547335, #Titanus
    4570517, #Harbinger
    4910893, #Aria Fey
    5075635, #Starships
    5176216, #Antiqua
    4624534, #Harokai
    4442461, #Titanic Dragon
    4604736, #of the North
    4460492, #Holifear
    5323883, #Digitallias
    5416935, #Akatsuki
    5304027, #Pyre
    5396113, #Terra Basilisk
    5490132, #Sunavalon
    5187975, #Rulers of Name
    5541864, #Kuroshiro
    5597068, #Goo-T
    # 5576395, #Heaven-Knights
    5582929, #Seafolk
    4399429, #Hakaishin Archfiend
    5592020, #Bound
    4359326, #Eldertech
    4050998, #Mage & Spell Tomes
    5615949, #Alchemaster
    5642481, #Daemon Engine
    4395391, #Trapod
    5549562, #Travelsha
    5717718, #Pixel  Monsters
    5713627, #Yeet
    5109480, #Kyudo
    4337568, #Dreadator
    5601607, #Chaos Performer
    # 5755617, #Shagdi
    4963487, #Battletech
    # 5758077, #Faust
    5675322, #Kojoten
    4960158, #Skafos
    6236137, #Tacticore
    5860710, #Uwumancer
    5541683, #Hydrovenal
    5766412, #Karmasattva
    5834507, #Nadiupant
    4806770, #Chronotiger
    5145725, #Remnant
    5587605, #Hot Pink
    5917260, #Koala
    2788655, #Ravager
    5824862, #Titanic Moth
    5925194, #Yurei
    5868144, #Tsurumashi
    5781120, #Stars
    5619459, #ANIMA
    5935151, #Shirakashi
    2952495, #Genjutsu
    5979832, #Raycor
    4501871, #Oni Assassins
    6050332, #Nermusa
    6078350, #Majecore
    5869257, #Yova
    5098946, #Guildimension
    6044732, #Armorizer
    6044655, #Vampop☆Star
    6135219, #The Parallel
    3689114, #LeSpookie
    6209092, #Acrimonic
    5884678, #Arsenal
    6121762, #Hydromunculus
    6233896, #Mirror Force Archetype
    4667428, #Xiuhqui
    6040042, #Kuuroma
    6247363, #Rowa - Elusive Power
    6163866, #Black Blood
    6227419, #Deep Burrower
    # 3080272, #Nightshade
    6267789, #Armamemento
    6262300, #Muntu
    5297494, #Thunderclap
    6294677, #Diabolition
    6334551, #Wild Hunt
    6291306, #Galaxieve
    5830740, #New Order
    4237940, #Taida
    4769548, #Empyreal
    5647256, #Meterao
    6405675, #Dark Kingdom
    4382580, #Mythical Winged Beasts
    # 6309748, #Kuuroma Support
    6446977, #Tagteamer
    6434960, #World Reaper
    6256752, #Concept of Reality
    4361777, #Eviction
    6347993, #Headhunter
    5818764, #Firewild
    6460257, #Dark Arts
    5145725, #Remnant
    6537631, #Bucket Squad
    6547017, #World Reaper Support
    6477846, #Cosmic Primal
    6395566, #Submerzan
    # 6578295, #Crypt
    6585445, #PPDC
    6563112, #NTG
    6582550, #Darkwater
    6560628, #Charismatic
    6600896, #Glow Gods
    6604359, #Chronoruler
    6601142, #Serpent Night
    6649729, #Flamiller
    6670355, #Railreich
    6611617, #Frostyre
    6677155, #Colossus
    3068977, #Nekojishi
    4456007, #Latria
    6674104, #Geschellschcaft
    6699578, #GG (Galatic Gods)
    6707275, #Malevolessence
    4406016, #Onion Slice
    6719358, #Vengeful Tox
    6733479, #Ookazi
    6188330, #Giga Havoc
    6777854, #Nebulline
    6772951, #Starter Squad
    6760980, #Final Dream
    6785271, #Aria Fey: Part 2
    6116920, #Frozen Ritual
    6793361, #Lacrimosa
    6793365, #Faust
    6793451, #P@rol
    # 4330341, #D.N.M.Q.
    6807125, #Drakin
    6834530, #Princess Connect!
    5571430, #Plushmages
    5269100, #Orb Magician
    6616619, #Queltz
    6785434, #Moira
] + [
    6353294, #Generic Monsters I
    6353380, #Generic Monsters II
    6353400, #Generic Monsters III
    6353414, #Generic Monsters IV
    6511321, #Generic Monsters V
    6353430, #Generic Spells
    6419184, #Generic Spells II
    6353449, #Generic Traps
    6598717, #Generic Traps II
    6353457, #Assorted TCG Single Support
    #6353465, #Staples
]

banlist = [
    6358712,          #Imported 1
    6751103,          #Imported 2
    6358715,          #Unimported
    
    5895579,          #Retrains
    5855756, 5856014, #Forbidden
    5857248,          #Limited
    5857281,          #Semi-Limited
    5857285,          #Unlimited
]

alt_arts = [
    6532506, #1.0
]

test = [
    6254262
]

beta = [
    #prio
    6801590, #Earthbound Immortal Support
    #reg
    6802790, #Blackclaw
    5270321, #Apocrypha
    6616619, #Queltz
    6712994, #Silent
    5571430, #Plushmages 
    6591759, #Suzerain
    6834530, #Princess Connect
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
    6751103 => EXU_IMPORT,
    
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
