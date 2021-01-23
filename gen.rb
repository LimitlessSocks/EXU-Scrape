require 'json'

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
        $DB_CUSTOM[id]["src"] rescue "null"
    else
        "https://www.duelingbook.com/images/low-res/#{id}.jpg"
    end
end

Deck = Struct.new(:id, :main, :side, :extra, :author, :name, :description, :thumb, :thumb_custom, :deck_path) {
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
