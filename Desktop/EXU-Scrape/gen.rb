require 'json'

$DB_CUSTOM = nil
$DB_YCG = nil

def load_dbs
    db_path = File.join File.dirname(__FILE__), "db.json"
    ycg_path = File.join File.dirname(__FILE__), "ycg.json"
    if $DB_CUSTOM.nil?
        $DB_CUSTOM = JSON::parse File.read(db_path)
    end
    # if $DB_YCG.nil?
        # $DB_YCG = JSON::parse File.read("ycg_path")
    # end
end

def get_url(id, custom=true)
    return if id.nil? || id.empty?
    load_dbs
    if custom
        $DB_CUSTOM[id]["src"] rescue "null"
    else
        "https://www.duelingbook.com/images/low-res/#{id}.jpg"
    end
end

Deck = Struct.new(
    #common properties
    :id,
    :author, :name,
    :thumb, :thumb_custom,
    :description,
    #deck properties
    :main, :side, :extra, :deck_path,
    #archetype properties
    :deckIds, :cardIds, :excludeIds,
    :deckWidth, :extraRows,
    :tags,
) {
    def to_html
        $BOILERPLATE % self.to_h
    end
    
    def make_link
        res = "<a class=\"deck-link\" href=\"./#{id}\" id=\"#{id}\">"
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
