require 'date'
Dir.chdir File.dirname __FILE__

date_modified = {}
prefix = "db-"
Dir["./../log/#{prefix}*"].each { |file|
    date = File.basename(file, ".txt")[prefix.size..-1]
    File.read(file).scan(/property '.+?' of card id (\d+) .+? was changed/).map(&:first).each { |card_id|
        date_modified[card_id] ||= []
        date_modified[card_id] << date
    }
}

def str_to_date(str)
    DateTime.strptime str, "%m-%d-%Y.%H.%M.%S"
end

system "jq -f find-dateless.jq ../db.json -r > missing.txt"

File.read("missing.txt").lines.each { |line|
    id, name = line.chomp.split(" ", 2)
    next if date_modified[id].nil?
    dates = date_modified[id]
    dates.sort_by! { |str| str_to_date str }
    puts <<~EOT
        "#{id}": { "added": [ "#{dates.first}" ], "comment": "Based on first edit." },
    EOT
}
