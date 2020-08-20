$comb_replay = File.read("comb/replay.js")

# plays = ["To GY", "SS ATK", "SS DEF", "Activate ST", "Declare",]
# replay_arr.filter(e => plays.indexOf(e.play))
require 'json'
require 'capybara'
puts "Loading capybara..."
$session = Capybara::Session.new(:selenium)
puts "Loaded!"

weekly11 = [
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
]

ycs_dino_devestation = [
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
]

focus = ycs_dino_devestation
name = "ycs_dino_devestation"
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
            # log = action["log"]
            play = action["play"]
            card and play and $valid_actions.include?(play)
            # card and log and log["public_log"].include?(card["name"])
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
