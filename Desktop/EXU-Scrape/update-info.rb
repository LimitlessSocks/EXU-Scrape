require 'json'
require 'open-uri'

$version = "7"
$api_url = "https://db.ygoprodeck.com/api/v#$version/"
# $card_db_url = "https://db.ygoprodeck.com/api/v#$version/cardinfo.php"

#cardinfo cardsets
def read_save_file(mode="cardinfo")
    url = $api_url + mode + ".php"
    remote = open(url)
    local_file = open("info/" + mode + ".json", "w")
    local_file.write remote.read
    local_file.close
end

OPERATIONS = %w(cardinfo cardsets)
OPERATIONS.each { |op|
    read_save_file op
}