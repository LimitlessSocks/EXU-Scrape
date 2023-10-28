require 'open3' # for diffy
require 'diffy'

Entry = Struct.new(:name, :id, :prop, :from, :to)

def get_id(name)
    name.gsub(/\W+/, "_")
end

def pluralize(s, n, suffix="s")
    n == 1 ? s : s + suffix
end

$processed = {}
def process_section(to_process, outfile)
    to_process.sort! { |e1, e2|
        e1_processed = $processed[e1.id]
        e2_processed = $processed[e2.id]
        e1_processed ? e2_processed ? 0 : -1 : e1.name <=> e2.name
    }
    processed = {}
    
    prev_name = nil
    skip_count = 0
    to_process.each.with_index(1) { |entry, i|
        
        if $processed[entry.id]
            skip_count += 1
            next
        end
        unless skip_count.zero?
            outfile.puts "<p class=\"skip\">(skipped #{skip_count} #{pluralize("duplicate card", skip_count)})</p>"
            skip_count = 0
        end
        
        processed[entry.id] = true
        
        # progress = "#{i}/#{total}"
        # print progress + "\r"
        
        diff = Diffy::SplitDiff.new(entry.from, entry.to, :format => :html)
        
        outfile.puts "<div class=\"diff-whole\">"
        if prev_name != entry.name
            id = get_id entry.name
            outfile.print "<h3 id=\"#{id}\">"
            outfile.print "<a class=\"toplink\" href=\"##{id}\">#</a> "
            outfile.puts "#{entry.name}</h3>"
            # outfile.puts "(#{progress}) #{entry.name}</h2>"
        end
        outfile.puts "<h4>Property: #{entry.prop}</h4>"
        outfile.puts "<div class=\"diff-entry\">"
        outfile.puts "<div class=\"diff-side\">"
        outfile.puts diff.left
        outfile.puts "</div>"
        outfile.puts "<div class=\"diff-side\">"
        outfile.puts diff.right
        outfile.puts "</div>"
        outfile.puts "</div>"
        outfile.puts "</div>"
        
        prev_name = entry.name
    }
    unless skip_count.zero?
        outfile.puts "<p class=\"skip\">(skipped #{skip_count} #{pluralize("duplicate card", skip_count)})</p>"
    end
    
    $processed.merge! processed
end

def generate_out_diff(path)
    base = File.basename path, ".*"
    out_html = File.join "log-out", base + ".html"

    File.write File.join("log-out", "diffy.css"), Diffy::CSS_COLORBLIND_1
    
    lines = File.read(path).split(/\r?\n|\r/)
    changed_cards = {}
    added_cards = {}
    removed_cards = []
    puts "[v2] Processing input file #{path} (#{lines.size})..."
    
    idx = 0
    while lines[idx]
        line = lines[idx]
        
        if line =~ /\[(\d+)\] note: property '(.+?)' of card id (\d+) \((.+)\).*?changed/
            deck_id, prop, id, name = $1, $2, $3, $4
            from = lines[idx + 1]
            to = lines[idx + 2]
            changed_cards[deck_id] ||= []
            changed_cards[deck_id].push Entry.new(name, id, prop, from, to)
            idx += 2
        elsif line =~ /\[main\] note: \[-\] removed old card (\d+) \((.+)\)/
            id, name = $1, $2
            removed_cards.push Entry.new(name, id)
        elsif line =~ /\[(\d+)\] note: \[\+\] added new card (\d+) \((.+)\)/
            deck_id, id, name = $1, $2, $3
            added_cards[deck_id] ||= []
            added_cards[deck_id].push Entry.new(name, id)
        end
        
        idx += 1
    end
    
    puts "Done processing."
    puts "Writing to output file..."
    outfile = File.open(out_html, "w")
    outfile.puts "<!DOCTYPE html>"
    outfile.puts "<html lang=\"en\">"
    outfile.puts "<head>"
    outfile.puts "  <meta charset=\"UTF-8\">"
    outfile.puts "  <link rel=\"STYLESHEET\" href=\"../card-viewer.css\">"
    outfile.puts "  <link rel=\"STYLESHEET\" href=\"style.css\">"
    outfile.puts "  <title>EXU: Changes for #{path}</title>"
    outfile.puts "  <script src=\"./main.js\"></script>"
    outfile.puts "</head>"

    outfile.puts "<body>"
    outfile.puts "<h1>Database Update Log for <code>#{path}</code></h1>"

    # toc
    outfile.puts "<ol id=\"toc\">"
    outfile.puts "  <li><a href=\"#newCards\">Newly Added Cards</a></li>"
    outfile.puts "  <li><a href=\"#removedCards\">Removed Cards</a></li>"
    outfile.puts "  <li><a href=\"#changedCards\">Changed Cards</a></li>"
    outfile.puts "</ol>"

    # new cards
    outfile.puts "<h1 id=\"newCards\">Newly Added Cards</h1>"
    outfile.puts "<div class=\"minimizable\">"
    added_cards.each { |id, entries|
        h2_id = "DeckAdd#{id}"
        outfile.puts "  <h2 id=\"#{h2_id}\"><a class=\"toplink\" href=\"##{h2_id}\">#</a> Deck #{id}</h2>"
        outfile.puts "    <ul>"
        entries.sort_by(&:name).each { |entry|
            outfile.puts "      <li class=simple-card>#{entry.name}</li>"
        }
        outfile.puts "    </ul>"
    }
    outfile.puts "</div>" #close minimizable
    # removed cards
    outfile.puts "<h1 id=\"removedCards\">Removed cards</h1>"
    outfile.puts "<div class=\"minimizable\">"
    outfile.puts "  <ul>"
    removed_cards.sort_by(&:name).each { |entry|
        outfile.puts "    <li class=simple-card>#{entry.name}</li>"
    }
    outfile.puts "  </ul>"
    outfile.puts "</div>" #close minimizable
    # changes
    outfile.puts "<h1 id=\"changedCards\">Changed Cards</h1>"

    outfile.puts "<div class=\"minimizable\">"

    total = changed_cards.size
    total_changes = changed_cards.sum { |key, arr| arr.size }
    outfile.puts "<p>Number of changes: ~#{total_changes} #{pluralize "card", total_changes} in #{total} #{pluralize "decklist", total}</p>"
    outfile.puts "<hr>"

    changed_cards.each.with_index(1) { |(id, entries), i|
        progress = "#{i}/#{total}"
        print id.to_s.ljust(10) + progress + "\r"
        
        h2_id = "DeckChange#{id}"
        outfile.puts "<h2 id=\"#{h2_id}\"><a class=\"toplink\" href=\"##{h2_id}\">#</a> Deck #{id}</h2>"
        outfile.puts "<div class=\"deck-changes\">"
        
        process_section entries, outfile
        
        outfile.puts "</div>"
    }

    outfile.puts "</div>" #close minimizable

    ## tidying up ##

    outfile.puts "</body>"
    outfile.puts "</html>"
    outfile.close
    puts 
    puts "Wrote to #{out_html}"
    puts "Done."
end


ARGV.each { |path|
    generate_out_diff path
}
