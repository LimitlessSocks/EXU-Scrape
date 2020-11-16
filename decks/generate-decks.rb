require 'nokogiri'
require 'json'

$BOILERPLATE = File.read("boilerplate.html")
$CONFIG_PATH = "./decks.json"
$INDEX_PATH = "./index.html"

Deck = Struct.new(:id, :main, :side, :extra, :author, :name, :description) {
    def to_html
        $BOILERPLATE % self.to_h
    end
}

def ids_of(thing)
    thing.map { |e| e["id"] }
end

def parse_deck!(deck_path)
    xml = File.read(deck_path)
    doc = Nokogiri::XML xml
    id = doc.css("deck").first["id"] || File.basename(deck_path, ".xml")
    
    defaults = {
        "author" => "(Unknown)",
        "name" => id,
        "description" => "<i>No description.</i>",
    }
    
    ds = Deck.new(
        id,
        ids_of(doc.css("main card")),
        ids_of(doc.css("side card")),
        ids_of(doc.css("extra card")),
        *%w(author name description).map { |name|
            value = doc.css("meta #{name}").children.to_html.strip
            value = defaults[name] if value.empty?
            value
        }
    )
    
    File.write("#{id}.html", ds.to_html)
    
    ds
end

index = File.read($INDEX_PATH)

res = ""

deck_config = JSON::parse File.read($CONFIG_PATH)

indent = " " * 8
deck_config["order"].each { |prop|
    cfg = deck_config[prop]
    res += "\n" + indent + "<h2>" + cfg["name"] + "</h2>"
    cfg["lists"].each { |list_name|
        ds = parse_deck! "./res/#{list_name}"
        res += "\n" + indent + "<a href=\"./#{ds["id"]}\">" + ds["name"] + "</a>"
    }
    
    # listing.add_child "\n#{indent}<h2>#{cfg["name"]}</h2>"
    # listing.add_child "\n#{indent}<a href='#{prop}'>#{prop}</a>\n"
}


index.sub!(/(<div id="listing">)[\s\S]+?(\n    <\/div>)/, '\1' + res + '\2')
File.write $INDEX_PATH, index