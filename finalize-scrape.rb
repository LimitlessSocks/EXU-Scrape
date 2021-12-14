$SCRAPE_FILE = "scrapes.json"

#common functions
$log_file = nil
def log(src, info)
    str = "[#{src}] #{info}"
    puts str.gsub(/\r/, "\n")
    $log_file.puts str if $log_file
end

def get_database(outname, noisy: true)
    require 'json'
    if File.exist? "#{outname}.json"
        file = File.open "#{outname}.json", "r:UTF-8"
        text = file.read
        file.close
        log "main", "Reading #{outname}.json" if noisy
        JSON.parse text
    else
        log "main", "Creating new file #{outname}.json" if noisy
        {}
    end
end

#specific
def get_option(opts)
    puts "=============================="
    finish = opts.delete :finish
    opts.each { |key, val|
        puts " #{key}) #{val}"
    }
    if finish
        puts "------------------------------"
        puts " ENTER) finish"
        opts[""] = true
    end
    puts "=============================="
    option = nil
    until opts.include? option
        unless option.nil?
            puts "Invalid option #{option.inspect}"
        end
        option = STDIN.gets.chomp
    end
    option
end

def display_key(obj)
    if String === obj
        puts obj.gsub(/^/m, "    ")
    else
        p obj
    end
end

def interact_phase(old_database, database, changed_ids, removed_ids)
    log "interact", "Beginning interaction phase."

    log "interact", "Changed ids: #{changed_ids}"

    new_database = database.dup

    puts "=============================="
    puts "DATABASE INTERACTION"
    loop {
    begin
        option = get_option(
            "i" => "Select card by [i]d",
            "p" => "Select card by [p]attern search",
            finish: true
        )
        if option.empty?
            log "interact", "Exiting interaction"
            break
        end
        log "interact", "Keypress: #{option.inspect}"
        case option
        when "p"
            puts "Target parameter (default: name):"
            parameter = STDIN.gets.chomp
            parameter = "name" if parameter.empty?
            
            puts "Input pattern (regular expression):"
            pattern = Regexp.new STDIN.gets.chomp, Regexp::IGNORECASE
            
            matches = []
            
            new_database.each { |key, value|
                if pattern === value[parameter]
                    matches << value
                end
            }
            removed_ids.each { |rid|
                value = old_database[rid]
                if pattern === value[parameter]
                    matches << value
                end
            }
            
            count = matches.size
            
            matches.each.with_index(1) { |match, i|
                puts "(#{i}/#{count}) #{match["id"]} #{match["name"]}"
                display_key match["effect"]
            }
            ids = matches.map { |match| match["id"].to_s }
            if count.zero?
                log "interact", "No cards found matching #{pattern.inspect}."
            else
                log "interact", "Found cards with ids #{ids}."
            
                operation = nil
                while operation.nil? or operation == "d"
                    if operation == "d"
                        puts "Enter space-separated id(s):"
                        ids = STDIN.gets.chomp.split
                        matches.select! { |match| ids.include? match["id"] }
                        log "interact", "Removed from selection: #{ids}"
                    end
                    operation = get_option(
                        "r" => "[r]eject all changes (save old versions)",
                        "a" => "[a]ccept all changes (save new versions)",
                        "d" => "[d]elete id(s) from operation selection and re-prompt",
                        finish: true,
                    )
                    if operation.empty?
                        log "interact", "No action taken."
                    end
                end
                
                case operation
                when "r"
                    source_db = old_database
                    log "interact", "Replacing ids with old version: #{ids}"
                when "a"
                    source_db = new_database
                    log "interact", "Replacing ids with new version: #{ids}"
                end
                
                if source_db
                    ids.each { |id|
                        database[id] = source_db[id] || database[id]
                    }
                end
            end
            
            
        when "i"
            puts "Input card id:"
            card_id = nil
            until old_database[card_id] or new_database[card_id]
                unless card_id.nil?
                    puts "Invalid ID #{card_id.inspect}"
                end
                card_id = STDIN.gets.chomp
            end
            # puts card_id
            
            old_entry = old_database[card_id]
            new_entry = new_database[card_id]
            
            old_name = old_entry && old_entry["name"]
            new_name = new_entry && new_entry["name"]
            
            name = if old_name == new_name
                old_name
            else
                "#{old_name} / #{new_name}"
            end
            
            puts "== #{name} (#{card_id}) =="
            
            puts "Enter input parameter (or ENTER, to see entire hash):"
            parameter = STDIN.gets.chomp
            
            
            
            if old_entry == new_entry
                puts "No changes made to #{card_id} (#{name})"
            else
                puts ">> Old entry <<"
                old_value = old_entry && !parameter.empty? ? old_entry[parameter] : old_entry
                display_key old_value
                puts 
                
                puts ">> New entry <<"
                new_value = new_entry && !parameter.empty? ? new_entry[parameter] : new_entry
                display_key new_value
                puts
                
                old_or_new = get_option(
                    "o" => "Replace with [o]ld entry",
                    "n" => "Replace with [n]ew entry",
                    "x" => "No action [x]",
                )
                
                if old_or_new == "o"
                    database[card_id] = old_entry
                    log "interact", "Saved old version of #{card_id} (#{name})"
                elsif old_or_new == "n"
                    database[card_id] = new_entry
                    log "interact", "Saved new version of #{card_id} (#{name})"
                else
                    #no action
                    log "interact", "No action taken"
                end
            
            end
            
            
        else
            log "interact", "Unrecognized input command."
        end
    rescue Interrupt => e
        puts "Are you sure you want to exit interaction? ^C again to quit. ENTER to continue."
        begin
            STDIN.gets
        rescue Interrupt => e
            return false
        end
    end
    }
    true
end

if __FILE__ == $0
    require 'json'
    scrape_info = JSON::parse File.read $SCRAPE_FILE
    keys = scrape_info.keys
    
    if keys.empty?
        puts "No scrapes in progress."
        exit 2
    end
    
    option = nil
    if ARGV.empty?
        puts "Choose a scrape:"
        o = get_option(keys.map.with_index(0) { |k, i|
            [i.to_s(36), k]
        }.to_h)
        o = o.to_i(36)
        option = keys[o]
    else
        option = ARGV[0]
        if /^[0-9a-z]+$/ === option
            val = keys[option.to_i(36)]
            unless val.nil?
                puts "Are you sure you want to use scrape #{val}? Press ^C to cancel."
                STDIN.gets
                option = val
            end
        end
    end
    
    unless keys.include? option
        puts "Invalid option: #{option.inspect}"
        exit 1
    end
    
    $log_file = File.open("log/#{option}.txt", "a:UTF-8")
    log "final", "Completing scrape at #{Time.now.strftime("%m-%d-%Y.%H.%M.%S")}"
    info = scrape_info[option]
    
    outname = info["outname"]
    changed = info["changed"]
    removed = info["removed"]
    
    database = get_database "tmp/#{option}"
    old_database = get_database outname
    
    interact_phase(old_database, database, changed, removed)
    puts "Press ENTER to confirm database entry."
    STDIN.gets
    
    # commit file
    File.write "#{outname}.json", database.to_json
    
    # remove all associated temporary scrapes
    purged = 0
    scrape_info.each { |key, value|
        if value["outname"] == outname
            scrape_info.delete key
            to_delete = "tmp/#{key}.json"
            if File.exist? to_delete
                File.delete(to_delete)
                purged += 1
            else
                log "final", "Attempted to purge #{to_delete.inspect}, file did not exist."
            end
        end
    }
    
    File.write $SCRAPE_FILE, scrape_info.to_json
    
    log "final", "Finished in-progress scrape, removed #{purged} associated scrape(s)."
    
    $log_file.close
end