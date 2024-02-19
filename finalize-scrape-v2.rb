require 'json'
require_relative 'finalize-scrape.rb'

option = ARGV[0]

outname = "db"
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
