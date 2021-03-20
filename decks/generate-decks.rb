require_relative '../gen.rb'
require 'nokogiri'

$CONFIG_PATH = "./decks.json"
$INDEX_PATH = "./index.html"
$BOILERPLATE = File.read("boilerplate.html")

def parse_deck!(deck_path)
    xml = File.read(deck_path)
    doc = Nokogiri::XML xml
    p doc.css("main card").map { |e| e["id"] }
    id = doc.css("deck").first["id"] || File.basename(deck_path, ".xml")
    
    defaults = {
        "author" => "(Unknown)",
        "name" => id,
        "description" => "<i>No description.</i>",
        "thumb" => "",
    }
    
    ds = Deck.new
    ds.id = id
    ds.main = ids_of(doc.css("main card"))
    ds.side = ids_of(doc.css("side card"))
    ds.extra = ids_of(doc.css("extra card"))
    %w(author name description thumb).map { |name|
        value = doc.css("meta #{name}").children.to_html.strip
        value = defaults[name] if value.empty?
        ds[name] = value
    }
    ds.thumb_custom = (doc.css("meta thumb")[0]["custom"] != "false" rescue false)
    ds.deck_path = deck_path
    
    File.write("#{id}.html", ds.to_html)
    
    ds
end

index = File.read($INDEX_PATH)

res = ""

deck_config = JSON::parse File.read($CONFIG_PATH)

indent = " " * 8
sub_indent = " " * 12
deck_config["order"].each { |prop|
    cfg = deck_config[prop]
    res += "\n" + indent + "<h2>" + cfg["name"] + "</h2>"
    res += "\n" + indent + "<div class=deck-link-listing>"
    if cfg["lists"].empty?
        res += "\n" + sub_indent + "<p><em>Nothing here yet.</em></p>"
    end
    cfg["lists"].each { |list_name|
        ds = parse_deck! "./res/#{list_name}"
        res += "\n" + sub_indent + ds.make_link
    }
    res += "\n" + indent + "</div>"
    
    # listing.add_child "\n#{indent}<h2>#{cfg["name"]}</h2>"
    # listing.add_child "\n#{indent}<a href='#{prop}'>#{prop}</a>\n"
}


index.sub!(/(<div id="listing">)[\s\S]+?(\n    <\/div>)/, '\1' + res + '\2')
File.write $INDEX_PATH, index