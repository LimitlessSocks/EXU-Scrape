require 'csv'
require 'cgi'
require 'uri'

def escape(*args)
    CGI::escapeHTML *args
end

def el(tag, value, **opts)
    attributes = ""
    unless opts.empty?
        attributes = " " + opts
            .map { |attr, attrval| "#{attr}=#{attrval.inspect}" }
            .join(" ")
    end
    res = "<#{tag}#{attributes}>#{value}</#{tag}>"
end

HOST_MAP = {
    "svgdb.me" => "Shadowverse",
    "sv.bagoum.com" => "Shadowverse",
    "buddyfight.fandom.com" => "Future Card Buddyfight",
    "cardfight.fandom.com" => "Cardfight Vanguard",
    "deviantart.com" => "Artist's DeviantArt",
    "duelmasters.fandom.com" => "Duel Masters",
    "cardmaker.net" => "cardmaker.net",
    "skeb.jp" => "Artist's Skeb",
    "instagram.com" => "Artist's Instagram",
    "static.wikia.nocookie.net/powerrangers" => lambda { |url|
        if url["KSZe"]
            "Kikai Sentai Zenkaiger"
        else
            nil
        end
    },
    "artstation.com" => lambda { |url|
        if url["artwork/JlnK50"]
            "League of Legends"
        else
            "Artist's ArtStation"
        end
    },
    "elderscroller.artstation.com" => "Artist's ArtStation",
    "gemy.artstation.com" => "Artist's ArtStation",
    "angelarium.net" => "Angelarium",
    "weasyl.com" => "Artist's Weasyl",
    "grandchase.fandom.com" => "Grand Chase",
    "facebook.com/valkyrieconnect.ateam" => "Valkyrie Connect",
    "facebook.com/VConnect.Indo" => "Valkyrie Connect",
    "garm.ml" => "Valkyrie Connect",
    "twitter.com/vconnect_jp" => "Valkyrie Connect",
    "aminoapps.com/p/vyqe4f" => "Valkyrie Connect (?)",
    "fowdb.altervista.org" => "Force of Will",
    "botm.fandom.com" => "Beasts of the Mezozoic",
    "emilywilloughby.com" => "Artist's Website",
    "sciencephoto.com" => "Science Photo Library",
    "gatherer.wizards.com" => "Magic the Gathering",
    "novataxa.blogspot.com" => "Species New to Science",
    "reddit.com/r/btd6" => "Artist's Reddit Post",
    "yugipedia.com" => "Yu-Gi-Oh!",
    "xn--cckp5c6czi2302avwxa.gamematome.jp" => "Othellonia",
    "pixiv.net" => "Artist's Pixiv",
    "luckandlogic.fandom.com" => "Luck and Logic",
    "pad.fandom.com" => "Puzzles and Dragons",
    "rageofbahamut.fandom.com" => "Rage of Bahamut",
	"scabard.com" => "Scabard Dungeons and Dragons (?)"
}

VALID_TWITTER_ARTISTS = %w(MarkWitton nurikabenuri)
VALID_TWITTER_ARTISTS.each { |artist|
    HOST_MAP["twitter.com/#{artist}"] = "Artist's Twitter"
}
def parse_source(url)
    begin
        u = URI(url)
        host = u.host&.sub(/^((www|m(obile)?)\.)+/, "")
        display = HOST_MAP[host]
        if display.nil?
            # try successive path slices
            paths = u.path.split("/")
            (0...paths.size).each { |i|
                display = HOST_MAP[host + paths[0..i].join("/")]
                break unless display.nil?
            }
        end
        if Proc === display
            display = display.call url
        end
        if display.nil?
            raise "Could not resolve host: #{host}\n--> #{u.host}#{u.path}\n--> #{url}"
        end
        display
    rescue URI::InvalidURIError, ArgumentError
        url || ""
    end
end

VALID_PARSES = %w(
    Instagram Twitter Skeb Weasyl
    DeviantArt Tumblr ArtStation Pixiv
    Buddyfight\ Fandom
    Reddit
    Angelarium
    SciencePhoto
)
PERSONAL_WEBSITES = %w(
    emilywilloughby ryanpancoast jnelsonstudio ldra
)
def simplify_strip(str)
    str.downcase.gsub(/[^a-z]/, "")
end
def simple_parse_source(url)
    result = VALID_PARSES.find { |parse|
        simplify_strip(url)[simplify_strip(parse)]
    }
    if result.nil?
        result = "Website" if PERSONAL_WEBSITES.find { |site| url[site] }
    end
    raise "Could not resolve artist link: #{url}" if result.nil?
    result
end

file = ARGV[0]

$build = ""
def output(line)
    if Array === line
        line.each { |l| output l }
    else
        $build += line + "\n"
    end
end

output <<PREAMBLE
<table id="credits">
    <tr>
        <th class="bare">Card Name</th>
        <th class="bare">Card Id</th>
        <th class="bare" id="source-header">Source</th>
        <th class="bare" id="artist-header">Artist</th>
        <th class="bare">Notes</th>
    </tr>
PREAMBLE

ART_LINKS  = %w(1 2 3).map { |e| "Art Link #{e}" }
NOTE_LINKS = %w(1 2 3).map { |e| "Note Link #{e}" }
CSV.foreach(file, headers: true) { |row|
    output '    <tr>'
    arts = ART_LINKS
        .map { |link| row[link] }
        .compact
    
    note_replace = NOTE_LINKS
        .map { |link| row[link] }
        .compact
        .map { |str| str.split(":", 2).map &:strip }
    
    name = row["Card Name"]
    id = row["Card Id"]
    src = row["Source"]
    artist = row["Artist"]
    notes = row["Notes"]
    note_replace.each { |find, repl|
        notes&.sub! find, el("a", find, href: repl)
    }
    
    out_lines = []
    out_lines << escape(name)
    out_lines << el("a", id, href: "./card?id=#{id}")
    out_lines << if src.nil?
        ""
    else
        el("a", escape(parse_source(src)), href: src)
    end
    out_lines << if artist.nil?
        ""
    elsif arts.empty?
        escape(artist)
    else
        art_joined = arts
            .map { |art|
                el("a", escape(simple_parse_source(art)), href: art)
            }
            .join(" &sdot; ")
        escape("#{artist} (") + art_joined + ")"
    end
    out_lines << if notes.nil?
        ""
    else
        notes
    end
    
    output out_lines.map { |line| " " * 8 + el("td", line) }
    output '    </tr>'
}
output '</table>'

credit_file = "credit.html"
out = File.read(credit_file)
out.sub!(/<table.+<\/table>/m, $build.strip)
File.write credit_file, out