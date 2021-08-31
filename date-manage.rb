require_relative "finalize-scrape.rb"
require 'json'
require 'date'

action = ARGV[0]
param = ARGV[1]

if param.nil? || action.nil?
    STDERR.puts "Expected command line argument, received none"
    STDERR.puts "ruby populate-date-added.rb [action] [db-name]"
    STDERR.puts "  [action]     Available parameters:"
    STDERR.puts "    deduce             default; reads corresponding logs and populates"
    STDERR.puts "    add [id] [pairs*]  sets add-removal pairs for card #id"
    STDERR.puts "    integrate          updates the appropriate database with info"
    STDERR.puts "  [db-name]    e.g., `db` or `sff`"
    exit 1
end

def str_to_date(str)
    DateTime.strptime str, "%m-%d-%Y.%H.%M.%S"
end

base = get_database param
date_added = get_database param + "-date-added"

date_added["added"] ||= {}
date_added["removed"] ||= {}

in_progress = {}
in_progress["added"] = {}
in_progress["removed"] = {}

commit_changes = true

puts "NOTE: No log file being generated for this action"
if action == "deduce"
    log "deduce", "reading relevant logs"

    prefix = "log/#{param}-"
    all_logs = Dir[prefix + "*"].map { |path|
        text = File.open(path, "r:UTF-8").read
        date = File.basename path[prefix.size..-1], ".*"
        [date, text]
    }

    log "deduce", "Done reading logs"

    add_remove_regex = /(?:(added) new|(removed) old) card (\d+) \((.+?)\)/

    all_logs.each { |date, text|
        log "log_read", "parsing log/#{param}-#{date}.txt"
        text.scan(add_remove_regex).each { |a, b, id, name|
            method = a || b
            in_progress["added"][id] ||= []
            in_progress["removed"][id] ||= []
            in_progress[method][id] << date
        }
    }

    log "deduce", "Done parsing logs"

    base.each { |id, card|
        next unless card["custom"] && card["custom"] > 0
        log "save", "Updating card #{id} (#{card["name"]})"
        [ "added", "removed" ].each { |method|
            next if in_progress[method][id].nil?
            in_progress[method][id].sort_by! { |t| str_to_date t }
        }
        break
    }

    log "deduce", "Done sorting DB"
    date_added = in_progress
elsif action == "add"
    def card_param?(word)
        word == "card" || word == "deck"
    end
    i = 2
    cards = []
    until i >= ARGV.size
        
        # pairs = ARGV[4..-1]
        param = ARGV[i]
        unless card_param? param
            STDERR.puts "Unrecognized param: #{param}"
            exit 2
        end
        case param
        when "card"
            cards << ARGV[i += 1]
        when "deck"
            # cards << 
            STDERR.puts "Unimplemented: deck"
        else
            STDERR.puts "Unrecognized add `#{type}`"
            exit 2
        end
        
        # read pair
        i += 1
        pairs = []
        until ARGV[i].nil? || card_param?(ARGV[i])
            pairs << ARGV[i]
            i += 1
        end
    end
    cards.each { |id|
        card = base[id]
        if card.nil?
            STDERR.puts "Note: nonexistent card id #{id}"
            next
        end
        puts "Identified card: #{card["id"]} #{card["name"].inspect}"
        in_progress["added"][id] = []
        in_progress["removed"][id] = []
        pairs.each_slice(2) { |added, removed|
            in_progress["added"][id] << added
            in_progress["removed"][id] << removed if removed
        }
    }
    date_added = in_progress
    
elsif action == "integrate"
    commit_changes = false
    
    log "integrate", "Checking each entry in date-added file..."
    missing = []
    date_added["added"].each { |id, added|
        # p id
        card = base[id]
        if card.nil?
            # STDERR.puts "Could not find id #{id}"
            missing << id
            next
        end
        card["date"] = added[0]
    }
    
    log "integrate", "Could not find #{missing.size}/#{date_added["added"].size} id(s)"
    log "integrate", "(#{missing.uniq.size} unique)"
    
    File.write param + ".json", base.to_json
else
    STDERR.puts "Unrecognized action: `#{action}`"
    exit 3
end

if commit_changes
    outname ||= param + "-date-added.json"
    log "main", "Writing to outfile #{outname}"
    File.write outname, date_added.to_json
end