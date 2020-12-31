require 'nokogiri'
require 'json'

$BOILERPLATE = File.read("boilerplate.html")
$CONFIG_PATH = "./decks.json"
$INDEX_PATH = "./index.html"

$DB_CUSTOM = nil
$DB_YCG = nil
def load_dbs
    if $DB_CUSTOM.nil?
        $DB_CUSTOM = JSON::parse File.read("../db.json")
    end
    # if $DB_YCG.nil?
        # $DB_YCG = JSON::parse File.read("../ycg.json")
    # end
end


def get_url(id, custom=true)
    return if id.nil? || id.empty?
    load_dbs
    if custom
        $DB_CUSTOM[id]["src"]
    else
        "https://www.duelingbook.com/images/low-res/#{id}.jpg"
    end
end

Deck = Struct.new(:id, :main, :side, :extra, :author, :name, :description, :thumb, :thumb_custom, :deck_path) {
    def to_html
        $BOILERPLATE % self.to_h
    end
    
    def make_link
        res = "<a class=\"deck-link\" href=\"./#{id}\">"
        # p [thumb, thumb_custom]
        unless thumb.empty?
            url = get_url thumb, thumb_custom
            res += "<img src=\"#{url}\"/>"
        end
        # res += name
        res += "<p>" + name + "</p>"
        res += "</a>"
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
        "thumb" => "",
    }
    
    ds = Deck.new(
        id,
        ids_of(doc.css("main card")),
        ids_of(doc.css("side card")),
        ids_of(doc.css("extra card")),
        *%w(author name description thumb).map { |name|
            value = doc.css("meta #{name}").children.to_html.strip
            value = defaults[name] if value.empty?
            value
        },
        (doc.css("meta thumb")[0]["custom"] != "false" rescue false),
        deck_path,
    )
    
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