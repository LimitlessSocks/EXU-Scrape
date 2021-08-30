require_relative "finalize-scrape.rb"
require 'json'
require 'date'

param = ARGV[0]
action = ARGV[1] || "deduce"

if param.nil?
    STDERR.puts "Expected command line argument, received none"
    STDERR.puts "ruby populate-date-added.rb [db-name] [action]"
    STDERR.puts "  [db-name]    e.g., `db` or `sff`"
    STDERR.puts "  [action]     deduce => default; reads corresponding logs and populates"
    STDERR.puts "               add => unimplemented"
    exit 1
end

exit unless action == "deduce"

def str_to_date(str)
    DateTime.strptime str, "%m-%d-%Y.%H.%M.%S"
end

puts "NOTE: No log file"
base = get_database param
date_added = get_database param + "-date-added"

date_added["added"] ||= {}
date_added["removed"] ||= {}

in_progress = {}
in_progress["added"] = {}
in_progress["removed"] = {} 

log "main", "reading relevant logs"

prefix = "log/#{param}-"
all_logs = Dir[prefix + "*"].map { |path|
    text = File.open(path, "r:UTF-8").read
    date = File.basename path[prefix.size..-1], ".*"
    [date, text]
}

log "main", "Done reading logs"

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

log "main", "Done parsing logs"

base.each { |id, card|
    next unless card["custom"] && card["custom"] > 0
    log "save", "Updating card #{id} (#{card["name"]})"
    [ "added", "removed" ].each { |method|
        next if in_progress[method][id].nil?
        in_progress[method][id].sort_by! { |t| str_to_date t }
    }
    break
}


log "main", "Done sorting DB"
date_added = in_progress


File.write param + "-date-added.json", date_added.to_json