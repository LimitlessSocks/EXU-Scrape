require_relative '../gen.rb'

$CONFIG_PATH = "./archetypes.json"
$INDEX_PATH = "./index.html"
$BOILERPLATE = File.read("boilerplate.html")

def parse_archetype!(obj)
    ds = Deck.new
    ds.name = obj["name"]
    ds.thumb = obj["thumb"]
    ds.thumb_custom = true
    ds.id = ds.name.gsub(/\s+/, "")
    ds.author = obj["author"]
    ds.description = obj["description"]
    ds.main = obj["deckIds"]
    ds.side = obj["cardIds"]
    File.write("#{ds.id}.html", ds.to_html)
    
    ds
end

index = File.read($INDEX_PATH)

archetype_data = JSON::parse File.read($CONFIG_PATH)
res = ""

indent = " " * 8
sub_indent = " " * 12
archetype_data["data"].each { |obj|
    ds = parse_archetype!(obj)
    res += "\n" + indent + ds.make_link
    # }
    # res += "\n" + indent + "</div>"
}

# puts res


index.sub!(/(<div id="listing".+?>)[\s\S]+?(\n    <\/div>)/, '\1' + res + '\2')

# puts index
File.write $INDEX_PATH, index