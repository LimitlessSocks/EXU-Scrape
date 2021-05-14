require 'diffy'

def get_body_segment!(lines)
    hs = [lines.shift]
    hs[0].gsub!(/^\[\d+\] (from|to): /, "")
    until /^\[\d+\]/ === lines[0]
        hs.push lines.shift
    end
    hs.join "\n"
end

path = ARGV[0]
base = File.basename path, ".*"
out_html = File.join "log-out", base + ".html"

File.write File.join("log-out", "diffy.css"), Diffy::CSS_COLORBLIND_1

Entry = Struct.new(:name, :id, :prop, :from, :to)

#TODO: include newly added cards
lines = File.read(ARGV[0]).split(/\r?\n|\r/)
to_process = []
puts "Processing input file..."
until lines.empty?
    t = lines.shift
    if /\[\d+\] note: property '(.+?)' of card id (\d+) \((.+?)\).*?changed/ === t
        prop, id, name = $1, $2, $3
        from = get_body_segment!(lines)
        to = get_body_segment!(lines)
        to_process.push Entry.new(name, id, prop, from, to)
    end
end

puts "Done processing."
puts "Sorting..."

to_process = to_process.sort_by! { |entry| entry.name }

puts "Done sorting."
puts "Writing to output file..."

outfile = File.open(out_html, "w")
outfile.puts "<!DOCTYPE html>"
outfile.puts "<html lang=\"en\">"
outfile.puts "<head>"
outfile.puts "  <meta charset=\"UTF-8\">"
outfile.puts "  <link rel=\"STYLESHEET\" href=\"../card-viewer.css\">"
outfile.puts "  <link rel=\"STYLESHEET\" href=\"style.css\">"
outfile.puts "  <title>EXU: Changes for #{path}</title>"
outfile.puts "</head>"
outfile.puts "<body>"
outfile.puts "<h1>Changes for <code>#{path}</code></h1>"

total = to_process.size
outfile.puts "<p>Number of changes: #{total}</p>"
outfile.puts "<hr>"

prev_name = nil
to_process.each.with_index(1) { |entry, i|
    progress = "#{i}/#{total}"
    print progress + "\r"
    diff = Diffy::SplitDiff.new(entry.from, entry.to, :format => :html)
    outfile.puts "<div class=\"diff-whole\">"
    if prev_name != entry.name
        id = "Entry#{i}"
        outfile.puts "<h2 id=\"#{id}\">"
        outfile.puts "<a href=\"##{id}\">#</a> "
        outfile.puts "(#{progress}) #{entry.name}</h2>"
    end
    outfile.puts "<h3>Property: #{entry.prop}</h3>"
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
outfile.puts "</body>"
outfile.puts "</html>"
outfile.close
puts 
puts "Wrote to #{out_html}"
puts "Done."
