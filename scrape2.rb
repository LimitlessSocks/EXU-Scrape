require 'capybara'
require 'json'
SAVE_STATE_PATH = "save_state.json"
DATABASE_REFERENCE_PATH = "database-reference.json"
OUTPUT_PATH = "tmp.json"
NOTES_PATH = "scrape2.log"

$log_file = File.open(NOTES_PATH, "a+")

def log(msg)
    $log_file.puts "[#{Time.now.to_s}] #{msg}"
end

log "Starting..."

ERRORLESS_STATE = {
    "index" => nil,
    "error" => false,
    "cards" => {}
}

start = Time.now

puts "Loading capybara..."
$session = Capybara::Session.new(:selenium)
puts "Loaded!"

$comb_request_per_deck = File.read("comb/per-deck.js")

database = JSON::parse File.read DATABASE_REFERENCE_PATH

puts "Waiting..."

collection = {}

# TODO: allow multiple scrapes at once?
if not File.exist? SAVE_STATE_PATH
    log "Starting fresh."
    puts "Writing default save state file..."
    save_state = ERRORLESS_STATE.dup
    File.write(SAVE_STATE_PATH, save_state.to_json)
else
    puts "Reading from existing save state file..."
    save_state = JSON::parse File.read(SAVE_STATE_PATH)
    if save_state["error"]
        log "Recovering from error:\n#{save_state["error"]}"
        puts "Recovering from error."
        save_state["error"] = false
        puts "Starting at index #{save_state["index"]}."
        collection = save_state["cards"]
    else
        log "Starting fresh."
        puts "Starting new scrape..."
    end
end

database.each.with_index(1) { |info, index|
    next if save_state["index"] and index < save_state["index"]
    
    id = info["id"]
    
    puts "Scraping #{id} (#{index}/#{database.size})..."
    old_collection = collection.dup
    begin
        $session.visit "https://www.duelingbook.com/deck?id=#{id}"
        $session.evaluate_script $comb_request_per_deck
        data = nil
        results = loop do
            data = $session.evaluate_script "window.responseData;"
            if data["loaded"]
                puts "Received!"
                collection[id] = data["cards"]
                break
            elsif data["tokenRequired"]
                log "Captcha encountered"
                puts "Requiring a token :("
                puts "Press ENTER to continue (after captcha solved)..."
                puts "\x07" # BEL!!
                STDIN.gets
            elsif data["deckDeleted"]
                puts "Deck deleted: #{info}"
                puts "Skipping"
                log "Missing deck #{info}"
                break
            end
        end
    rescue Exception => err
        STDERR.puts "Error: #{err.class.name.inspect}"
        STDERR.puts err
        save_state["index"] = index
        save_state["error"] = "#{err.class.name.inspect}\n#{err.to_s}"
        save_state["cards"] = old_collection
        break
    end
}

finish = Time.now
puts "Time elapsed: #{finish - start}s"
log "Time elapsed: #{finish - start}s"
if save_state["error"]
    log "Stopping due to error:\n#{save_state["error"]}"
    puts "Recovering from an error..."
    File.write SAVE_STATE_PATH, save_state.to_json
    puts "Wrote progress to #{SAVE_STATE_PATH}."
else
    log "Stopping normally."
    
    puts "Writing accumulated card file..."
    File.write OUTPUT_PATH, collection.to_json
    puts "Overwriting save file..."
    File.write SAVE_STATE_PATH, ERRORLESS_STATE.to_json
end
