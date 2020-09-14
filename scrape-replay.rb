$comb_replay = File.read("comb/replay.js")

# plays = ["To GY", "SS ATK", "SS DEF", "Activate ST", "Declare",]
# replay_arr.filter(e => plays.indexOf(e.play))
require 'json'
require 'capybara'
STDERR.puts "Loading capybara..."
$session = Capybara::Session.new(:selenium)
STDERR.puts "Loaded!"

ReplayInfo = Struct.new(:name, :replays) do
    def merge(name, *others)
        ReplayInfo.new name, replays + others.flat_map(&:replays)
    end
end

weekly11 = ReplayInfo.new("weekly11", [
    "343487-20661105",
    "14422-20660958",
    "481907-20660901",
    "354255-20661293",
    "453279-20660876",
    "534677-20660866",
    "343487-20662188",
    "479696-20662198",
    "332143-20662538",
    "362746-20661893",
    "14422-20661982",
    "362746-20663002",
    "332143-20663038",
    "534677-20662733",
    "14422-20663529",
    "14422-20664735",
    "332143-20666201",
])

ycs_dino_devestation = ReplayInfo.new("ycs_dino_devestation", [
    "534677-20358748",
    "453279-20358512",
    "453279-20368153",
    "453279-20342563",
    "509709-20336290",
    "282034-20334065",
    "534677-20328742",
    "106930-20327304",
    "122221-20321965",
    "534677-20302578",
    "509709-20298155",
    "481907-20297741",
    "106930-20294493",
    "332143-20285453",
    "479696-20282953",
    "122221-20245875",
    "481907-20242298",
    "453279-20218752",
    "509709-20216464",
    "474911-20209140",
    "332143-20205828",
    "481907-20276153",
    "474911-20275626",
    "123-20274886",
    "349034-20273099",
    "453279-20263864",
    "106930-20263685",
    "282034-20258524",
    "192142-20257417",
    "332143-20247226",
    "123-20199561",
    "14422-20199440",
    "192142-20193869",
    "106930-20186553",
    "343043-20183028",
    "509709-20181680",
    "205781-20175212",
    "453279-20168782",
    "356-20167424",
    "479696-20167096",
    "441001-20166224I",
])

# note: missing replay
weekly12 = ReplayInfo.new("weekly12", [
    "77474-20835283",
    "332143-20835190",
    "453279-20835247",
    "332143-20835986",
    "349034-20836022",
    "163270-20835724&",
    "453279-20836359",
    "349034-20836864",
    "453279-20836986",
    "332143-20837515",
    "205781-20836741",
    "205781-20837511",
    "205781-20838212",
    "453279-20838314",
    "488933-20838937",
    "488933-20839571",
])

# madness; missing replay
exu_1_year_anniversary = ReplayInfo.new("exu_1_year_anniversary", [
    "479696-20858956",
    "205781-20859136",
    "349034-20859188",
    "441001-20858945",
    "343487-20859256",
    "481907-20859026",
    "205781-20859722",
    "343487-20860117",
    "509709-20860803",
    "205781-20861010",
    "205781-20861351",
])

weekly10 = ReplayInfo.new("weekly10", [
    "77474-20488301",
    "332143-20488300",
    "452058-20488555",
    "77474-20488753",
    "406828-20488198",
    "334828-20488224",
    "77474-20489166",
    "441001-20488658",
    "205781-20488795",
    "349034-20488681",
    "282034-20489985",
    "332143-20490309",
    "349034-20490343",
    "354255-20490321",
    "343487-20490749",
    "406828-20490771",
    "343487-20491406",
    "77474-20491966",
    "77474-20493014",
    "406828-20493741",
])

weeklies10_12 = weekly10.merge("weeklies10_12", weekly11, weekly12)

weekly13 = ReplayInfo.new("weekly13", [
    "205781-21013134",
    "481907-21013038",
    "441001-21013148",
    "453279-21014399",
    "282034-21014491",
    "481907-21015199",
    "481907-21015647",
    "474911-21014762",
    "481907-21016447",
    "205781-21016633",
])

weekly14 = ReplayInfo.new("weekly14", [
    "212949-21200034",
    "205781-21200325",
    "481907-21200024",
    "106930-21200581",
    "332143-21200551",
    "462598-21200495",
    "479696-21200217",
    "205781-21201254",
    "332143-21201562",
    "349034-21201625",
    "481907-21201648",
    "474911-21201841",
    "349034-21202442",
    "122221-21202457",
    "212949-21202196",
    "106930-21202638",
    "462598-21202875",
    "84755-21203061",
    "481907-21203519",
    "332143-21203186",
    "122221-21203311",
    "332143-21203186",
    "84755-21205047",
    "84755-21205547",
])

weeklies10_14 = weeklies10_12.merge("weeklies10_14", weekly13, weekly14)

ladder = ReplayInfo.new("ladder", [
    "205781-20945615", #8-26-2020
    "453279-20958986", #8-26-2020
    "343043-20975731", #8-27-2020
    "205781-20979077", #8-27-2020
    "205781-20979462", #8-27-2020
    "205781-20987072", #8-27-2020
    "453279-20987617", #8-27-2020
    
    "349034-20996905", #8-28-2020
    "349034-20997284", #8-28-2020
    "343043-21006633", #8-28-2020 (1 dud, 1 single)
    "343043-21005563", #8-28-2020
    
    "344433-21042427", #8-29-2020
    
    "453279-21054712", #8-30-2020
    
    "205781-21112869", #9-01-2020
    "205781-21113434", #9-01-2020
    "349034-21126735", #9-01-2020
    
    "122221-21135632", #9-02-2020
    "453279-21143155", #9-02-2020
    
    "205781-21191410", #9-04-2020
    "205781-21191991", #9-04-2020
    
    "343043-21270921", #9-07-2020
    
    "453279-21292423", #9-08-2020
    "332143-21304988", #9-08-2020
    
    "453279-21317270", #9-09-2020
    "344433-21321837", #9-09-2020
    
    "332143-21348609", #9-10-2020
    "332143-21420481", #9-12-2020
])

# change this to change results
focus = ladder





name = focus[:name]
focus = focus[:replays]
# name = "exu_1_year_anniversary"
# focus = weekly12
# name = "weekly12"
# focus = ycs_dino_devestation
# name = "ycs_dino_devestation"
# focus = weekly11
# name = "weekly11"

$database = {}

$cards_total_count = Hash.new 0
$cards_win_count = Hash.new 0
$valid_actions = [
    "To GY", "Activate ST", "Declare", "To ST",
    "Normal Summon",
    "SS ATK", "SS DEF",
    "OL ATK", "OL DEF",
    "Activate Field Spell",
    "Mill",
]

focus.each { |link|
    $session.visit("https://www.duelingbook.com/replay?id=#{link}")
    data = nil
    while data.nil?
        data = $session.evaluate_script $comb_replay
    end

    data["games"].each { |game|
        winner = game["winner"]
        loser = game["loser"]
        actions = game["actions"]
        cards_appear = {}
        
        actions.select! { |action|
            card = action["card"]
            play = action["play"]
            if card and play and $valid_actions.include?(play)
                
                # only counter cards player owns
                # card["username"] and action["username"] ? card["username"] == action["username"] : true
                true
            else
                false
            end
        }
        actions.each { |action|
            card = action["card"]
            id = card["id"]
            #override id
            orig_label = $database.find { |id, name| name == card["name"] }
            if orig_label
                id = orig_label[0]
            end
            
            next if id.zero? #Skip tokens
            
            username = action["username"]
            id_unique = "#{id}.#{username}"
            
            $database[id] ||= card["name"]
            
            next if cards_appear.include? id_unique
            
            # count occurrence
            cards_appear[id_unique] = true
            $cards_total_count[id] += 1
            
            # count win/loss
            if action["username"] == winner
                $cards_win_count[id] += 1
            end
        }
    }
}

data = $cards_total_count.map { |id, total|
    wincount = $cards_win_count[id]
    winrate = wincount.to_f / total
    percent = (winrate * 10000).round / 100.0
    [id, [
        id,
        $database[id],
        wincount,
        total,
        "#{percent}%"
    ]]
}.to_h

unless Dir.exist? "data"
    Dir.mkdir "data"
end

File.write("data/#{name}.json", data.to_json)

data.to_a.sort_by { |id, data| data[1] }.each { |id, data|
    puts data.join(";")
}
