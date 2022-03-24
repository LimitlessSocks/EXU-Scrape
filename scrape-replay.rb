$comb_replay = File.read("comb/replay.js")

# plays = ["To GY", "SS ATK", "SS DEF", "Activate ST", "Declare",]
# replay_arr.filter(e => plays.indexOf(e.play))
require 'json'
require 'capybara'
STDERR.puts "Loading capybara..."
$session = Capybara::Session.new(:selenium)
STDERR.puts "Loaded!"

class ReplayInfo < Struct.new(:name, :replays)
    @@local_replays = []
    def initialize(*args)
        super(*args)
        @@local_replays << self
    end

    def merge(name, *others)
        ReplayInfo.new name, replays + others.flat_map(&:replays)
    end
    
    # def self.replays
        # @@replays.dup
    # end
    
    def self.get_replay(name)
        @@local_replays.find { |replay| replay.name == name }
    end
    
    def self.replay_names
        @@local_replays.map(&:name)
    end
    
    def self.usage!
        STDERR.puts "  Usage: #{$0} name"
        puts "  >> " + self.replay_names.sort.join(" ")
        exit 1
    end
end

load 'replays.rb'

if ARGV.empty?
    STDERR.puts "Error: No arguments passed."
    ReplayInfo.usage!
end

ARGV.each { |arg|
    focus = ReplayInfo.get_replay arg

    if focus.nil?
        STDERR.puts "Error: Replay name not found."
        ReplayInfo.usage!
        next
    end
    
    name = focus[:name]
    focus = focus[:replays]

    STDERR.puts "Starting to parse #{name}"

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

    count = focus.size
    focus.each.with_index(1) { |link, i|
        STDERR.puts "Visiting #{i} of #{count}..."
        $session.visit("https://www.duelingbook.com/replay?id=#{link}")
        data = nil
        while data.nil?
            data = $session.evaluate_script $comb_replay
        end
        
        if data["error"]
            STDERR.puts "Error occurred: #{data["message"]}"
            STDERR.puts "Skipping."
            next
        end
        
        data["games"].each { |game|
            # puts "Parsing next game!"
            winner = game["winner"]
            loser = game["loser"]
            actions = game["actions"]
            cards_appear = {}
            # p "Winner : #{game["winner"]}"
            # p "Loser  : #{game["loser"]}"
            # STDIN.gets
            
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
                
                # p "ID:", id
                # p "ID_UNIQUE:", id_unique
                # p "ACTION:", action
                # p "WINNER?", winner
                # gets
                
                next if cards_appear.include? id_unique
                
                # if id == 1088520
                    # puts "Found a unique occurrence of 1088520, #{id_unique}"
                    # puts 
                # end
                
                # count occurrence
                cards_appear[id_unique] = true
                $cards_total_count[id] += 1
                
                # count win/loss
                if action["username"] == winner
                    $cards_win_count[id] += 1
                end
            }
            # p "Win counts:"
            # p $cards_win_count
            # p "Wins/total of 1088520:"
            # p $cards_win_count[1088520], $cards_total_count[1088520]
            # STDIN.gets
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
    
    tmp = File.open("tmp/replay-copy-#{name}.txt", "w")
    data.to_a.sort_by { |id, data| data[1] }.each { |id, data|
        tmp.puts data.join(";;")
    }
    tmp.close
}
