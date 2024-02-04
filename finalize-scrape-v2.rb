require 'json'
require_relative 'finalize-scrape.rb'

now_time_ident = ARGV[0]

outname = "db"
database = get_database "tmp/#{option}.json"
old_database = get_database outname
verdict_path = "tmp/verdict-#{option}.json"
