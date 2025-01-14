require 'capybara'
require 'json'

puts "Loading capybara..."
$session = Capybara::Session.new(:selenium)
puts "Loaded!"

$script = File.read("comb/request.js")
# workaround for CORS errors
puts "Visiting duelingbook.com..."
$session.visit("https://www.duelingbook.com")

puts "Injecting API..."
$session.evaluate_script $script

database = [
    # Support
    6787178, #Super Quant Support
    6774584, #Koa'ki Meiru Support
    6514931, #Dinomist Support
    6590945, #Constellar Support
    6746888, #Performapal Sky Magician & Odd-Eyes Support
    6708539, #Trickstar Support
]

puts "Making ID requests..."
database.each { |id|
    $session.evaluate_script "DeckRequest.Load(#{id});"
}
puts "Finalizing..."
$session.evaluate_script "DeckRequest.Finish();"

puts "Waiting for results..."
results = loop do
    data = $session.evaluate_script "DeckRequest.GetResults();"
    break data["results"] if data["success"]
    if data["error"]
        puts ">>>> Deck with id #{id} not found, moving on"
        break []
    end
end
puts "Results:"
p results