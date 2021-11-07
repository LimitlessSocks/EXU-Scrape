$comb_book = File.read("comb/read-book.js")

require 'json'
require 'capybara'
STDERR.puts "Loading capybara..."
$session = Capybara::Session.new(:selenium)
STDERR.puts "Loaded!"

$session.visit("https://www.duelingbook.com/html5")
data = nil
while data.nil?
    data = $session.evaluate_script $comb_book
end

# make a proper database instead of an array

data = data
    .map { |o| [o["id"], o] }
    .reject { |id, obj| obj["type"] == "Proxy" }
    .to_h

File.write("ycg.json", data.to_json)
STDERR.puts "Done, wrote #{data.size} entries."