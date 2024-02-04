require 'json'
require 'cgi'
require 'open3' # for diffy
require 'diffy'
require_relative 'diff-lib.rb'

VERDICT_OPTIONS = <<~EOT
    <span class="accept emoji-button" alt="Accept changes">✅</span>
    <span class="reject emoji-button" alt="Reject changes">❌</span>
    <span class="remove emoji-button" alt="Remove card!!">🪓</span>
    <span class="claim emoji-button" alt="Claim review">💼</span>
    <span class="clear emoji-button" alt="Clear my reactions">🗑️</span>
EOT

def safe_diffy_html(left, right)
    left = left.gsub(/\r\n|\r/, "\n")
    right = right.gsub(/\r\n|\r/, "\n")
    Diffy::SplitDiff.new(left, right, :format => :html)
end

def card_display(card, key, diffs)
    # TODO: html escape
    result = []
    result << '<div class="inline-card">'
    
    result << "<h4>#{card["name"]}</h4>" if diffs["name"]
    
    diffs.each { |check, lr|
        next if DiffLib::DIFF_CHECKS.include? check
        my_prop = lr[key]
        tag = key == :left ? "del" : "ins"
        result << "<h5>#{check}: <#{tag}>#{my_prop}</#{tag}></h5>"
    }
    
    DiffLib::DIFF_CHECKS.each { |check|
        next if check == "pendulum_effect" && card["pendulum"] != 1
        result << "<h5>#{check}</h5>"
        effect = if diffs[check]
            diffs[check][key]
        else
            # for symmetric styling
            "<div class='diff'><ul><li><code>#{card[check]}</code></li></ul></div>"
        end
        result << "<p>#{effect}</p>"
    }
    
    result << "</div>"
    result.join "\n"
end

output_name = "db"
now_time_ident = ARGV[0]

if now_time_ident.nil?
    STDERR.puts "Please call like #{$0} db-MM-DD-YYYY.HH.MM.SS corresponding to an existing scrape"
    exit 1
end

old_database = JSON::parse File.read "#{output_name}.json"
new_database = JSON::parse File.read "tmp/#{now_time_ident}.json"

ids = old_database.keys + new_database.keys
ids.uniq!

outfile = File.open("log-out/#{now_time_ident}.html", "w")
path = "log/#{now_time_ident}.txt"

outfile.puts <<~EOT
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <link rel="STYLESHEET" href="../card-viewer.css">
    <link rel="STYLESHEET" href="style.css">
    <title>EXU: Changes v2 for #{path}</title>
    <script>window.scrapeIdentifier = #{now_time_ident.inspect};</script>
    <script src="https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js"></script>
    <script src="./main-v2.js"></script>
  </head>
  <body>
    <article>
      <h1>Database Update Log for <code>#{path}</code></h1>
      <div>Your peer ID: <code id="my-peer-id">loading&hellip;</code></div>
      <div>Your alias: <input id="my-alias" type="text"></span></div>
      <div>Connect to host peer ID: <input id="host-peer-id" type="text"></span></div>
      <div id="chat">
        <h4>Chat</h4>
        <div id="chat-messages"></div>
        <input id="chat-input" type="text"></div>
      </div>
      <div>
        <button id="save-reactions">Save</button>
        <button id="load-reactions">Load</button>
      </div>
      <h2>Reaction Guide</h2>
      <div>
        <ul>✅ - The change is fine.</ul>
        <ul>❌ - The change is not fine, keep the old version.</ul>
        <ul>🪓 - Remove the card from the resulting database.</ul>
        <ul>💼 - Signal that this entry is being reviewed.</ul>
        <ul>🗑️ - Remove reactions from this entry.</ul>
      </div>
EOT

claves = {
    changed: [],
    removed: [],
    added: [],
}

# ids = [
    # "3353923",
    # "2609185",
    # "4379634",
    # "4077974",
    # "3312283",
    # "4192153",
# ]

# ids = []
# ids << old_database.find { |id, val| val["name"] == "Bucket Squadmech Hellfire Buster" }[0]

# STDIN.gets
ids.each.with_index { |id, j|
    # p "#{j}/#{ids.size} #{id}"
    old_card = old_database[id]
    new_card = new_database[id]
    
    # skip non-customs
    next if old_card && old_card["custom"].nil?
    next if new_card && new_card["custom"].nil?
    
    left_card = right_card = nil
    name = nil
    destination = nil
    
    if old_card.nil?
        # added new card
        destination = :added
        name = new_card["name"]
        puts name
        left_card = '<div class="empty inline-card">(was nothing)</div>'
        right_card = card_display new_card, nil, {}
    elsif new_card.nil?
        # removed old card
        destination = :removed
        name = old_card["name"]
        puts name
        left_card = card_display old_card, nil, {}
        right_card = '<div class="deleted inline-card">(now deleted)</div>'
    else
        destination = :changed
        # both cards, compare changes
        differences = DiffLib::ATTR_CHECKS.reject { |check|
            old_attr = old_card[check]
            new_attr = new_card[check]
            DiffLib::approximately_equal? old_attr, new_attr
        }
        
        # skip same-cards
        next if differences.empty?
        
        name = old_card["name"]
        if name != new_card["name"]
            name = "#{CGI::escapeHTML name} → #{CGI::escapeHTML new_card["name"]}"
        else
            name = CGI::escapeHTML name
        end
        puts name
        
        #TODO: html escape?
        diffs = differences.map { |check|
            left = old_card[check]
            right = new_card[check]
            diff = if DiffLib::DIFF_CHECKS.include? check
                diffy_output = safe_diffy_html left, right
                { left: diffy_output.left, right: diffy_output.right }
            else
                { left: left, right: right }
            end
            [check, diff]
        }.to_h
        left_card = card_display old_card, :left, diffs
        right_card = card_display new_card, :right, diffs
    end
    
    text = <<~EOT
    <div data-gid="#{id}">
        <h3>#{name}</h3>
        <h4>#{id} &sdot; <a href="https://www.duelingbook.com/card?id=#{id}" target="_blank">DB</a> &sdot; <a href="https://limitlesssocks.github.io/EXU-Scrape/card?id=#{id}" target="_blank">EXU</a></h4>
        <div class="verdict">
            #{VERDICT_OPTIONS}
            <span class="total-emoji"></span>
        </div>
        <div class="card-display">
            #{left_card}
            <div class="separator">➡️</div>
            #{right_card}
        </div>
    </div>
    EOT
    
    claves[destination] << text
}

%w(Changed Removed Added).each { |clave|
    sym = clave.downcase.to_sym
    outfile.puts "<h2>#{clave} cards</h2>"
    outfile.puts "<span>(The following options will change all of the reactions for each of the following entries.)</span>"
    outfile.puts <<~EOT
        <div class="overall verdict">
            #{VERDICT_OPTIONS}
        </div>
        <div class="change-entries">
            #{claves[sym].join "\n"}
        </div>
    EOT
}

outfile.puts "  </article>"
outfile.puts "</body>"
outfile.puts "</html>"
