require_relative "finalize-scrape.rb"
require 'json'
require 'date'

puts "No log file present."

param = ARGV[0] || "db"

# TODO: argparse
if param == "-h" || param == "--help" || param == "/h" || param == "/?"
    STDERR.puts "Expected command line argument, received none"
    STDERR.puts "Usage:"
    STDERR.puts "  Generates [db-name]-dates.json, to be used in normalize-composite.rb"
    STDERR.puts "  ruby date-manage.rb [db-name]"
    STDERR.puts "    [db-name]    e.g., `db` or `sff`. default: `db`"
    exit 1
end

def str_to_date(str)
    DateTime.strptime str, "%m-%d-%Y.%H.%M.%S"
end

base = get_database param
OUTPUT_DATES = param + "-dates"
# TODO: we probably don't need to re-read the old dates database
# if we're just gonna re-write it from scratch every time
date_added = get_database OUTPUT_DATES
date_added = {}

METHODS = %w(added removed)
METHODS.each { |meth|
    # mmm meth
    date_added[meth] ||= {}
}

log "deduce", "Reading relevant logs"

prefix = "log/#{param}-"
all_logs = Dir[prefix + "*"].map { |path|
    text = File.open(path, "r:UTF-8").read
    date = File.basename path[prefix.size..-1], ".*"
    [date, text]
}

log "deduce", "Done reading #{all_logs.size} logs"

add_remove_regex = /(?:(added) new|(removed) old) card (\d+) \((.+?)\)/

all_logs.each { |date, text|
    # log "log_read", "parsing log/#{param}-#{date}.txt"
    text.scan(add_remove_regex).each { |a, b, id, name|
        card = base[id]
        next unless card && card["custom"] && card["custom"] > 0
        method = a || b
        date_added["added"][id] ||= []
        date_added["removed"][id] ||= []
        date_added[method][id] << date
    }
}

log "deduce", "Done parsing logs"

base.each { |id, card|
    # log "save", "Updating card #{id} (#{card["name"]})"
    METHODS.each { |method|
        next if date_added[method][id].nil?
        date_added[method][id].sort_by! { |t| str_to_date t }
    }
    # break
}

# separate date and time
METHODS.each { |method|
    date_added[method].each { |card_id, values|
        date_added[method][card_id] = values.map { |str|
            date, time = str.split(".", 2)
            m, d, y = date.split("-")
            # normalize for db
            date = "#{y}-#{m}-#{d}"
            { date: date, time: time }
        }
    }
}

log "deduce", "Done sorting DB"

# TODO: add overrides json to implement old "add" pair feature
File.write "#{OUTPUT_DATES}.json", date_added.to_json
log "main", "Outputed to #{OUTPUT_DATES}.json"
