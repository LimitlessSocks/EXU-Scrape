require 'json'
require_relative 'finalize-scrape.rb'
require_relative 'diff-lib.rb'

# TODO: allow config
output_name = "db"

now_time_ident = Time.now.strftime("#{output_name}-%m-%d-%Y.%H.%M.%S")
now_time_name = "log/" + now_time_ident + ".txt"
$log_file = File.open(now_time_name, "w:UTF-8")

log "main", "Created log file #{now_time_name}"

old_database = JSON::parse File.read "#{output_name}.json"
new_database = JSON::parse File.read "#{output_name}-tmp.json"

# TODO: log decks by name not just submission_source id
changed_ids = []
new_database.each { |card_id, card|
    deck_id = card["submission_source"]
    display_text = "#{card_id} (#{card["name"]})" 
    
    # # dummy output information
    # log deck_id, "Starting to parse #{deck_id}"
    
    if card["custom"] and card["custom"] > 1
        log deck_id, "warning: card id #{display_text} is not public"
    end
    old_card = old_database[card_id]
    if !(old_card.nil? || card["custom"].nil?)
        DiffLib::ATTR_CHECKS.each { |check|
            unless DiffLib::approximately_equal?(old_card[check], card[check])
                changed_ids << card_id
                if check == "custom"
                    mode = ["public", "private"][card[check] - 1]
                    log deck_id, "note: card id #{display_text} was made #{mode}"
                else
                    log deck_id, "note: property '#{check}' of card id #{display_text} was changed"
                    log deck_id, "from: #{DiffLib::string_normalize old_card[check]}"
                    log deck_id, "to: #{DiffLib::string_normalize card[check]}"
                end
            end
        }
    elsif old_card.nil?
        log deck_id, "note: [+] added new card #{display_text}"
    end
    # log deck_id, "Finished scraping."
}

removed_ids = []

old_database.each { |id, card|
    unless new_database[id]
        log "main", "note: [-] removed old card #{id} (#{card && card["name"]})"
        removed_ids << id
    end
}

scrape_info = JSON::parse File.read $SCRAPE_FILE
scrape_info[now_time_ident] = {
    outname: output_name,
    changed: changed_ids,
    removed: removed_ids,
}
Dir.mkdir "tmp" unless File.exist? "tmp"
File.write "tmp/#{now_time_ident}.json", new_database.to_json
File.write $SCRAPE_FILE, scrape_info.to_json
$log_file.close

# write differences
# system "ruby get-diff-v2.rb #{now_time_name}"
system "ruby get-diff-v3.rb #{now_time_ident}"

system "ruby gen-dir.rb"

puts "Complete scrape by downloading verdict-#{now_time_ident}.json to ./tmp/ and running:"
puts "  finalize-scrape-v2.rb \"#{now_time_ident}\""
# puts "  finalize-scrape.rb \"#{now_time_ident}\""
