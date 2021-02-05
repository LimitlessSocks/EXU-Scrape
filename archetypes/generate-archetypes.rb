require_relative '../gen.rb'

$BASE = File.dirname(__FILE__)

$CONFIG_PATH        = File.join $BASE, "archetypes.json"
$INDEX_START_PATH   = File.join $BASE, "index-pre.html"
$INDEX_PATH         = File.join $BASE, "index.html"
$BOILERPLATE_PATH   = File.join $BASE, "boilerplate.html"

$BOILERPLATE = File.read $BOILERPLATE_PATH

$generated = {}

def parse_archetype!(obj)
    ds = Deck.new
    ds.name = obj["name"]
    ds.thumb = obj["thumb"]
    ds.thumb_custom = true
    ds.id = ds.name.gsub(/@/, "at").gsub(/[^a-zA-Z0-9]+/, "")
    ds.author = obj["author"]
    ds.description = obj["description"]
    ds.main = obj["deckIds"]
    ds.side = obj["cardIds"]
    ds.extra = obj["tags"] || []
    
    $generated[ds.id] = {
        name: ds.name,
        # id: ds.id,
        author: ds.author,
        description: ds.description,
        tags: obj["tags"]
    }
    
    out_path = File.join $BASE, "#{ds.id}.html"
    
    File.write(out_path, ds.to_html)
    
    ds
end

index = File.read($INDEX_START_PATH, :encoding => "utf-8")

archetype_data = JSON::parse File.read($CONFIG_PATH)
res = ""

indent = " " * 8
sub_indent = " " * 12
archetype_data["data"].sort_by { |obj| obj["name"].downcase }.each { |obj|
    ds = parse_archetype!(obj)
    res += "\n" + indent + ds.make_link
}

# puts res
# puts index
index = index % {
    listing: res,
    database: $generated.to_json
}

# index.sub!(/(<div id="listing".+?>)[\s\S]+?(\n    <\/div>)/, '\1' + res + '\2')

# puts index
File.write $INDEX_PATH, index, :encoding => "utf-8"