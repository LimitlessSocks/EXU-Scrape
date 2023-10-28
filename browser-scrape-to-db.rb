require 'json'

data = JSON::parse File.read "totalComposite.json"

results = {}
data.each { |deck_id, deck_data|
    all_cards = deck_data["side"] + deck_data["main"] + deck_data["extra"]
    all_cards.each { |obj|
        # only consider cards with more than 1 property
        # tcg cards show as just an id under this approach
        next if obj.size <= 1
        unless results[obj["id"]].nil?
            puts "[#{deck_id}] Duplicate card #{obj["id"]} #{obj["name"]} (home #{results[obj["id"]]["home"]})"
        end
        obj = obj.dup
        obj["home"] = deck_id
        results[obj["id"]] ||= obj
    }
}

puts "Custom count: #{results.size}"

# unify with tcg cards

puts "Unifying with ycg.json..."
ycg = JSON::parse File.read "ycg.json"
results.merge! ycg

File.write "unifiedComposite.json", results.to_json
