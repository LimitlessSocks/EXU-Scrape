require 'json'
require 'time'
require_relative 'finalize-scrape.rb'

option = ARGV[0]
outname = "db"

if option == "latest"
    latest_name, latest_time = Dir["tmp/verdict-#{outname}*.json"].map { |path|
        time = if /verdict-(.+?)\.json/ === path
            DateTime.strptime($1, "#{outname}-%m-%d-%Y.%H.%M.%S")
        else
            -1
        end
        [$1, time]
    }
    .select { |match, time| match }
    .max_by { |match, time| time }
    
    option = latest_name
end

database = get_database ARGV[1] || "tmp/#{option}"
old_database = get_database outname

p database.find { |k,v| v["name"].include? "Mekangel" }

verdicts = JSON::parse File.read "tmp/verdict-#{option}.json"

verdicts.each { |id, verdict|
    case verdict
    when "accept"
        # do nothing
    when "remove"
        database.delete id
    when "reject"
        database[id] = old_database[id]
    else
        STDERR.puts "I don't know what to do with verdict #{{id => verdict}}"
    end
}
# p database.find { |k,v| v["name"].include? "Mekangel" }

#TODO: remove old tmp info
File.write "#{outname}.json", database.to_json
puts "Finalized."
