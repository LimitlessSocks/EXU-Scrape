VALID_OPERATIONS = ["main", "banlist", "support", "test", "beta", "sff"]
VALID_NOTES = [nil, "temp"]
operation = ARGV[0]
note = ARGV[1]

unless VALID_OPERATIONS.include? operation
    STDERR.puts "Expected an operation [#{VALID_OPERATIONS * ", "}], got: #{operation.inspect}"
    exit 1
end
unless VALID_NOTES.include? note
    STDERR.puts "Expected an note [#{VALID_NOTES * ", "}], got: #{note.inspect}"
    exit 2
end

require 'capybara'
require 'json'
require_relative 'finalize-scrape.rb'
start = Time.now

puts "Loading capybara..."
$session = Capybara::Session.new(:selenium)
puts "Loaded!"

$comb_request_all = File.read("comb/request.js")

database = [
    # Support
    6787178,  #Super Quant Support
    6774584,  #Koa'ki Meiru Support
    6514931,  #Dinomist Support
    6590945,  #Constellar Support
    6746888,  #Performapal Sky Magician & Odd-Eyes Support
    6708539,  #Trickstar Support
    # 6787363,  #Random TCG Archetypes Support
    # 7546734,  #Random TCG Archetypes Support
    8202865,  #Random TCG Archetypes Support
    6008240,  #Summoned Skull Support
    6686412,  #Paladin Ritual Support
    6628957,  #Garzett Support
    6645825,  #Yubel Support
    6622494,  #Codebreaker Support
    6598859,  #of the Dark Support
    6556030,  #Boot-Up Gadget Support
    6524605,  #Pure Borrel/Rokket Support
    6791911,  #Kaiju Support
    4026672,  #Fushioh Richie Support
    # 6791947,  #Red-Eyes Support
    # 6450641,  #Gimmick Puppet Support
    6438706,  #Constellar/Tellarknight Support
    6412660,  #Umbral Horror/Numbers 43, 65, 80, and 96 Support
    # 6402157,  #D/D/D Support
    # 6412740,  #Megalith Support
    6407622,  #Chemicritter Support
    6365184,  #Nephthys Support
    6124612,  #Metaphys Support
    6360689,  #Digital Bug Support
    6292623,  #Ninja Support
    # 6245917,  #Marincess Support
    5954949,  #Yokai Support
    8766544,  #World Chalice/World Legacy Support
    6169009,  #Aquaactress Support
    6109070,  #Normal Monster Support
    # 6000654,  #Laval Support
    5844326,  #Danger! Support
    5936560,  #The Agent Support
    # 4422086,  #Mystrick Support
    5839316,  #Duo-Attribute Support
    6239411,  #Prank-Kids Support
    5894044,  #Shino Support
    5749949,  #Ancient Warriors Support
    # 4251928,  #Traptrix Support
    4936132,  #F.A. Support
    # 5177132,  #Darklord Support
    5219266,  #Phantom Beast Support
    5260210,  #Sylvan Support
    4810529,  #Blue-Eyes Support
    5496883,  #Normal Pendulum Support
    # 3256281,  #B.E.S. Support
    5782891,  #The Weather Support
    5194131,  #Fur Hire Support
    # 5720993,  #Watt Support
    4804758,  #Draconia Support
    4177191,  #Lightray Support
    5705030,  #Phantasm Spiral Support
    5668288,  #Volcanic Support
    # 5741889,  #Titanus Support
    5659403,  #X-Saber Support
    5751277,  #Krawler Support
    5744520,  #Dream Mirror Support
    6771198,  #Vendread Support
    2775342,  #Triamid Support
    6785116,  #Legendary Dragon, Fairy Tail, Dark World & Shiranui Support
    # 6787972,  #Orb Magician Support
    6792668,  #Jurrac Support
    6792679,  #Cyber Dragon Support
    6793309,  #Subterror Behemoth Support
    6793437,  #Artifact Support
    6793424,  #Time Thief Support
    6771472,  #Vendread Support
    6794841,  #Alien Support
    6798989,  #D.D. Support
    6807794,  #Hydrovenal Support
    6804358,  #Amorphage Support
    6804350,  #Cipher Support
    # 6804345,  #Cyberdark Support
    # 6804341,  #Bujin Support
    6780728,  #Hieratic Support
    4493192,  #Meklord Support
    6801590,  #Earthbound Support
    6858396,  #Mayakashi Support
    # 6858407,  #Graydle Support
    6845097,  #Mystic Elf & Celtic Guardian
    6881030,  #Hazy Flame Support
    6858740,  #Elementsaber Support
    # 6888197,  #ABC-Dragon/Gradius Support
    6913421,  #Vylon Support
    5793524,  #Number 54: Lion Heart Support
    # 6918022,  #Cyberdark Supports
    6936982,  #Thought Legacy Support
    6933325,  #Super Quant Support 2
    6942144,  #Mythical Beast Support
    6318313,  #Generation Fish Support
    6858407,  #Graydle Support
    6819600,  #Prometeor Support
    4805092,  #Legendary Dragon Support
    6981414,  #Magical Hat Support
    6952745,  #Tindangle Support
    # 6952371,  #True King Retrains
    7003669,  #Appliancer Support
    6993829,  #Lair of Darkness Support
    7015993,  #Sacred Beast Support
    7027863,  #Golden Ladybug Support
    7002660,  #Cipher Support
    5833853,  #Crab King Support
    7025794,  #Performage Support
    6891534,  #Harpie Support
    7094214,  #Evil HERO Support
    7085230,  #Chaos Support
    7022231,  #White Aura Support
    5615821,  #Onomat Support
    7251527,  #Dream Mirror Support
    5615821,  #Onomat Support
    7251527,  #Dream Mirror Support
    7263281,  #Hayabusa Support
    7306486,  #Galaxy Photon Support
    7311070,  #Virus Support
    6011815,  #lswarm Support
    7297777,  #Star Seraph Support
    7252887,  #Fabled Support
    7311950,  #Darkwater Support
    # 7428988,  #Hellvil Support
    7435843,  #Tokyo Terror Support
    7086187,  #Crystron Support
    2166281,  #World Reaper Support
    7446763,  #Fusion Parasite Support
    7478308,  #Predap Support
    6922630,  #Empowered Warrior Support
    7464737,  #Halvoran Support
    7458028,  #Masaki Support
    7484447,  #Artifact Support
    # 7462775,  #Armored Hunter / Raging Calamity Support
    # 5813034,  #Gimmick Puppet Support
    # 7463590,  #Poppin
    7499352,  #O.F.F
    # 7454784,  #Entropy Beast Support
    # 7503066,  #Tidalive Support
    6598851,  #Madoor
    7448539,  #Wight
    7499374,  #OFF 2
    7544944,  #Clear World
    7516633,  #Fire Fist
    7529948,  #Highlander Support
    6979146,  #T.G. Support
    # 7545154,  #Strannaut Support
    7568710,  #Windwitch Support
    9913178,  #Magnet Warrior Support
    7452180,  #Ceremonial Bell Support
    7531842,  #Psychic Support
    7556770,  #Battle Fader Support
    # 7595121,  #Ugrovs Support
    7389331,  #Charismatic Support
    7557629,  #Thunderclap Support
    7637725,  #Non-Existent Gimmick Support
    7608828,  #Princess Connect! Support
    7687348,  #Mind Layer Support
    6862415,  #PK Support
    7566464,  #Z-ARC Support
    7664359,  #of the Wasteland Support
    6226330,  #Acrimonic Support
    7679392,  #Toon, Fire King & Windwitch Support
    # 7647679,  #Black Blood Support
    # 6845360,  #Starter Squad
    7742679,  #Fog+Beast
    7659844,  #Relinquished
    7619657,  #Panda Support
    # 7737487,  #Hellvil Support
    7695428,  #Timelord Support
    7758078,  #Stromberg Support
    7763073,  #Darkwater Support
    7771474,  #Evil HERO Support
    7834508,  #Galaxieve Support
    7881252,  #Vision HERO Support
    7846987,  #of the Wasteland Support
    7852899,  #Abartech Support
    7885378,  #Sunavalon Support
    # 8079528,  #Gimmick Puppet Support
    7795290,  #Superheavy Samurai Support
    7973339,  #Stage Girl Support
    7995546,  #NTG Support
    5700651,  #Kyudo Support
    8055360,  #Baba Support
    5979508,  #Myutant Support
    8105851,  #Lightsworn Support
    9913180,  #Magistus Support
    7743608,  #Danger! Support
    8184053,  #Ancient Gear Support
    8224351,  #Ritual Beast Support
    8208847,  #Shark Support
    8174923,  #Crystalion Support
    8306788,  #Duston Support
    8194294,  #Jolsprit Support
    8430979,  #Xiuhqui Support
    8344690,  #Evol Support
    6879409,  #Genex Support
    # 8310242,  #Battlin' Boxer Support
    11001848, #Battlin' Boxer Support
    8187355,  #Reptilianne Support
    # 7914836,  #Cubic Support
    # 8119660,  #Darklord Marie Support
    8560865,  #E^rabastel Support
    8451189,  #Egyptian God/Divine Beast Support
    8624721,  #PSY-Frame Support
    8568805,  #Hotarugusa Support
    8681245,  #Chiron the Mage Support
    8353364,  #Gladiator Beast Support
    8664482,  #Zefra Support
    8109335,  #Entity Support
    8759630,  #Subject Fusion Spirit Xyz Support
    8686389,  #Mask Support
    8735092,  #Neo-Spacian/Neos Support
    8924579,  #Mudafi Support
    8960883,  #Pyramid of Light Support
    8976659,  #Fossil Support
    9015610,  #Starry Knight Support
    8832576,  #Stardust Support
    9044366,  #Watt Support
    7139390,  #Cloudian Support
    9094270,  #Elemental HERO Support (non-Neos)
    9104023,  #Plaguespreader Zombie Support
    # 9072263,  #Mathmech Support
    9105198,  #Dark Scorpion Support
    8405156,  #LoD Support
    9123660,  #Earth Guard League Support
    9223893,  #Nimble Support
    9233282,  #Blue-Eyes Support
    8982767,  #V-to-Z Unions Support
    9131225,  #Anti-Goo Support
    4825931,  #Fishin' Support
    7585957,  #Knights of Face Support
    9471210,  #Hermos Support
    9386456,  #Endless Sands Support
    9286017,  #Cheezbeast Support
    9391180,  #Dark Magician Support
    9484452,  #Gimmick Puppet Support
    # 8345249,  #Fossilrai Support
    # 9573052,  #Pyrabbit Support
    9467404,  #Naturia Support
    9118048,  #Pumpking Support
    9389725,  #Malefic Support
    9523870,  #Fairy Tail Support
    9764030,  #Dark Magician Support
    9517068,  #Starliege Support
    9514627,  #Travelsha Support
    9420032,  #Zoodiac Support
    9091180,  #Fur Hire Support
    # 8016535,  #roid Support
    9602551,  #Genex Support
    9850383,  #Elbeyonder Support
    9747849,  #Malicevorous Support
    9843646,  #Red-Eyes non-Effect Support
    9186912,  #Ojama Supports
    9944104,  #Blackwing Support
    3585517,  #Harpie Support
    9557295,  #Anglory Support
    9939604,  #Azur Lane Support
    9941444,  #Tundran Support
    9850403,  #Xöryne Support
    9870029,  #Bone Support
    9907517,  #Ice Counter Support
    10040214, #Artifact Support
    9907108,  #Panera Support
    10050632, #Gradius Support
    # 10050401, #B.E.S. Support
    9175751,  #Crystron Support
    9864486,  #Ninja Support
    9850838,  #Venom Support
    9630458,  #Numeron Support
    9847517,  #Materiactor Support
    10324587, #Witchwood Support
    9997560,  #Harokai Support
    10190817, #Underworld Support
    8254883,  #LV Support
    10416948, #Adventurer Support
    10481429, #Suship Support
    10485110, #Chronoruler Support
    10539415, #Collapse Support
    10486958, #Libromancer Support
    10481340, #Abartech Support
    9992148,  #Mist Valley Support
    10349615, #Demise/Ruin Support
    10601725, #Freed Support
    10512247, #Utopi/Onomat Support
    10684531, #Popping Prowess Support
    9700034,  #Malicevorous Support
    10491757, #Charismatic Support
    10010547, #Wattkinetic Puppeteer Support
    10667179, #Red-Eyes Support
    10732280, #Mechatech Support
    10830988, #NEX-Spacians
    10892302, #Scrylak Support
    10885995, #Blood Quartz Support
    10839624, #Prediction Princess Support
    
    #--------------------------------------------------------------------#
    # Archetypes
    # 4327693,  #Lacrimosa
    # 4367824,  #Death Aspects
    # 4376011,  #Combat Mechs
    4523067,  #Voltron
    # 4385932,  #Starbaric Crystal Beasts
    # 4540185,  #Emeraheart
    4757288,  #Pandas
    # 4861946,  #Poppin
    # 4547335,  #Titanus
    # 4570517,  #Harbinger
    4910893,  #Aria Fey
    # 5075635,  #Starships
    # 5176216,  #Antiqua
    # 4624534,  #Harokai
    # 4442461,  #Titanic Dragon
    4604736,  #of the North
    4460492,  #Holifear
    5323883,  #Digitallias
    # 5416935,  #Akatsuki
    # 5304027,  #Pyre
    # 5396113,  #Terra Basilisk
    # 5490132,  #Sunavalon
    5187975,  #Rulers of Name
    5541864,  #Kuroshiro
    5597068,  #Goo-T
    # 5576395,  #Heaven-Knights
    # 5582929,  #Seafolk
    # 4399429,  #Hakaishin Archfiend
    # 5592020,  #Bound
    # 4359326,  #Eldertech
    # 4050998,  #Mage & Spell Tomes
    5615949,  #Alchemaster
    5642481,  #Daemon Engine
    # 4395391,  #Trapod
    5549562,  #Travelsha
    # 5717718,  #Pixel Monsters
    5109480,  #Kyudo
    # 4337568,  #Dreadator
    5601607,  #Chaos Performer
    # 5755617,  #Shagdi
    4294973,  #Battletech
    # 5758077,  #Faust
    5675322,  #Kojoten
    4960158,  #Skafos
    6236137,  #Tacticore
    # 5860710,  #Uwumancer
    5541683,  #Hydrovenal
    5766412,  #Karmasattva
    5834507,  #Nadiupant
    4806770,  #Chronotiger
    # 5145725,  #Remnant
    # 5587605,  #Hot Pink
    5917260,  #Koala
    # 2788655,  #Ravager
    # 5824862,  #Titanic Moth
    # 5925194,  #Yurei
    5868144,  #Tsurumashi
    5781120,  #Stars
    # 5619459,  #ANIMA
    5935151,  #Shirakashi
    2952495,  #Genjutsu
    5979832,  #Raycor
    # 4501871,  #Oni Assassins
    # 6050332,  #Nermusa
    # 6078350,  #Majecore
    5869257,  #Yova
    # 5098946,  #Guildimension
    6044732,  #Armorizer
    7301908,  #Vampop☆Star
    6135219,  #The Parallel
    # 3689114,  #LeSpookie
    6209092,  #Acrimonic
    5884678,  #Arsenal
    # 6121762,  #Hydromunculus
    6233896,  #Mirror Force Archetype
    4667428,  #Xiuhqui
    # 6040042,  #Kuuroma
    6247363,  #Rowa - Elusive Power
    # 6163866,  #Black Blood
    # 6227419,  #Deep Burrower
    # 3080272,  #Nightshade
    6267789,  #Armamemento
    6262300,  #Muntu
    5297494,  #Thunderclap
    6294677,  #Diabolition
    6334551,  #Wild Hunt
    6291306,  #Galaxieve
    # 5830740,  #New Order
    4237940,  #Taida
    4769548,  #Empyreal
    5647256,  #Meterao
    # 6405675,  #Dark Kingdom
    7318790,  #Mythical Winged Beasts
    # 6309748,  #Kuuroma Support
    6446977,  #Tagteamer
    # 6434960,  #World Reaper
    6256752,  #Concept of Reality
    # 4361777,  #Eviction
    6347993,  #Headhunter
    # 5818764,  #Firewild
    # 6460257,  #Dark Arts
    # 5145725,  #Remnant
    6537631,  #Bucket Squad
    # 6547017,  #World Reaper Support
    7553027,  #Cosmic Primal
    # 6395566,  #Submerzan
    # 6578295,  #Crypt
    # 6585445,  #PPDC
    6563112,  #NTG
    6582550,  #Darkwater
    # 6560628,  #Charismatic
    # 7877196,  #Glow Gods
    6604359,  #Chronoruler
    6601142,  #Serpent Night
    # 6649729,  #Flamiller
    # 6670355,  #Railreich
    6611617,  #Frostyre
    6677155,  #Colossus
    3068977,  #Nekojishi
    # 4456007,  #Latria
    6674104,  #Geschellschcaft
    6699578,  #GG (Galatic Gods)
    # 6707275,  #Malevolessence
    # 4406016,  #Onion Slice
    6719358,  #Vengeful Tox
    6733479,  #Ookazi
    6188330,  #Giga Havoc
    # 6772951,  #Starter Squad
    6760980,  #Final Dream
    6785271,  #Aria Fey: Part 2
    6116920,  #Frozen Ritual
    6793361,  #Lacrimosa
    5895706,  #Faust
    6793451,  #P@rol
    # 4330341,  #D.N.M.Q.
    6807125,  #Drakin
    6834530,  #Princess Connect!
    5571430,  #Plushmages
    # 5269100,  #Orb Magician
    6616619,  #Queltz
    # 6785434,  #Moira
    # 7753448,  #Hellvil
    6874481,  #Dark Hole
    6895350,  #Owlsh
    # 6777854,  #Nebulline
    # 6849044,  #Nebulline
    8167114,  #Nebulline
    # 6806175,  #Chibright
    # 4330341,  #D.N.M.Q.
    6906385,  #Legendary Golems
    # 6848354,  #The 9s
    6948850,  #Mekkallegiate
    6933560,  #Revived Beasts
    # 4355718,  #Wild Rose
    7003838,  #Mechatech Dragons Eclipse and Nova + Overfunded Research
    # 5967432,  #Masquerado
    # 7008268,  #Fiendfyre
    7020690,  #Primal Forest
    6845786,  #Powerpuff
    7022155,  #Halvoran
    # 6811695,  #Catacomb
    6670355,  #Railreich
    7027111,  #Medaka
    6560628,  #Charismatic
    7027802,  #Deus Ex
    6869158,  #Infrastructure
    # 6770598,  #Bleakstory
    7140843,  #Pendant
    # 7127621,  #Dark Imp
    7124125,  #Anglory
    7138655,  #Witchwood
    # 7200158,  #Strannaut
    7203610,  #Andromeda
    7180332,  #Dual Asset
    7184403,  #Crystalion
    # 7256172,  #Wavering Winds
    11001854, #Wavering Winds
    # 7123560,  #Metal XO
    6837403,  #Malus
    7284131,  #Iterators
    7294550,  #Iterators: Part 2
    7247437,  #Intimidraco
    5731990,  #Entropy Beast
    7022063,  #Fishin'
    # 3617894,  #O.F.F
    7310491,  #Ak*ris
    # 7464943,  #Armored Hunter / Raging Calamity
    # 6526373,  #Phylabeast
    5822335,  #Tokyo Terror
    7367392,  #Bas-Yak
    5904696,  #Contraption
    # 7877183,  #Tidalive
    # 7443209,  #Mokey Mokey OTK
    7455513,  #Doom Instruments
    7163783,  #Lemuria
    7877166,  #Ugrovs
    7496225,  #Primordial Driver
    7166789,  #Ancestagon
    # 7318393,  #Anomantic
    # 7560045,  #Anomantic
    6997240,  #Stwyrmwind
    7410698,  #Bright Planet
    # 7495126,  #Sylphe
    # 7516077,  #Moonlit
    7516896,  #Darkest Power: Awor
    # 7503795,  #Pitch Black
    7522856,  #Abartech
    # 7432421,  #Fiendfyre
    7565819,  #Mind Layer
    3734721,  #Carcharrack
    5736933,  #Armatos Legio
    # 4377085,  #The Horde
    7548170,  #Psycircuit
    6848354,  #The 9s
    10421344, #Abyssal Enforcer
    7439337,  #Anti-Goo
    # 5841822,  #Tomes
    7547609,  #Nauticorpse
    7645365,  #Solomons Studies
    # 7671393,  #Pyrabbit
    # 7685326,  #Justice Knight
    # 7499095,  #Magistrophic
    7093024,  #Khremysis
    # 7577360,  #Tempo Warrior
    # 7586564,  #Straw Hat
    6123628,  #Stormrider
    4587548,  #Stage Girl
    # 7723773,  #Simulacra
    7678716,  #Vuluti
    # 7727566,  #Supermega
    7728700,  #Devivain
    7763820,  #Nekker
    7609855,  #Kitsento
    7714198,  #Attack on Titan
    # 7225933,  #Chima
    7236701,  #Erwormwood
    7730748,  #Magistar
    7769900,  #Thunderstrike Dragon
    # 7842189,  #The Aarp
    7882788,  #Des Aspect
    # 7783148,  #Tamed Calamity / Armored Tamer
    # 7823128,  #Sisage
    6222166,  #Ananta
    2795851,  #Conqueror
    7920705,  #Gaia's Chosen
    7816634,  #Dusk Brigade
    # 7985036,  #Innsmouth
    7937711,  #Hotarugusa
    # 3890554,  #Fireworks Girl
    # 7961741,  #Pluraid
    7519530,  #Armourizer Series: Fleurcrux
    7997640,  #Unbeing
    6635173,  #Xana
    7922328,  #Harokai
    7746134,  #Superego
    4475780,  #Ascending Fire
    # 7959099,  #Intranger
    7499374,  #O.F.F
    8034682,  #Circersolar
    8010982,  #Draken
    7563615,  #Metaverse Persona
    6979527,  #Pikachu
    7745973,  #Graal de Flamme
    7814419,  #Poppin
    4016329,  #Boehstoic
    7961879,  #Mermaidol
    8170513,  #Jolsprit
    # 8152211,  #Bolt Arc
    # 8105715,  #Spacial Demon
    # 8055913,  #Flutterbleu
    6086340,  #Zeniphyr
    # 3705612,  #Azure Reaper
    # 8013380,  #Cykoton
    8213421,  #Forge Breaker
    8221267,  #Imperialis
    5830740,  #New Order
    8196897,  #Anguish
    8269957,  #Mind Macabre
    8352501,  #Chirurgeon
    6516859,  #E^rabastel
    # 9608031,  #Fossilrai
    # 8345249,  #Fossilrai
    # 8475666,  #DragoThief
    8312789,  #Staysailor
    # 8457383,  #Dynamic Gnome
    8376563,  #LaVoix
    6707275,  #Malevolessence
    6356932,  #Cosmech
    6156689,  #Varagon
    6040042,  #Kuuroma
    # 8579730,  #Tensura
    # 8596515,  #Crystal Tower
    7225933,  #Chima
    7733925,  #Panera
    8656533,  #DAWN and RUIN
    5860293,  #Earth Guard League/Goranger
    8637210,  #Mudafi
    8533195,  #The Gashercore Collection
    8695927,  #Inu
    8283182,  #Shadow Whisperer
    8397719,  #Wrasslin'
    8308338,  #Cheezbeast
    8536599,  #Steelbrand
    8558559,  #Azur Lane
    # 8608821,  #C.I.
    # 8607327,  #Flamiller
    8631072,  #Penitent Wraith
    5887296,  #Mechaneer's
    8263489,  #The Legendary Exodia Necross Incarnate
    7727566,  #Supermega
    7874062,  #Conflagrant
    7027111,  #Medaka
    8760406,  #Nordic Champion
    # 9020851,  #Alarkite
    9079255,  #Nemesin
    # 8954457,  #Vendedda
    9016753,  #Dance of Swords
    # 8819779,  #Aequalis
    7074117,  #Scrylak
    9051430,  #Deadly Waters
    9109731,  #Endless Sands
    9022784,  #Gala-XY
    8177538,  #Tempestal Ascended
    9108451,  #Frorb
    9163949,  #Xöryne
    2942421,  #Antrap
    7528627,  #Red-White
    5269100,  #Orb Matchician
    9433755,  #Azathean
    9417588,  #Empyrodraco
    9347499,  #Yurei
    9469722,  #Geídst
    7731164,  #Beastmaster's
    9183380,  #Dino Exorcist
    # 8036906,  #Dralchemic
    # 9499776,  #Black Tear
    # 9436990,  #E^rabastel
    9593754,  #Dark Crusher
    3400704,  #Knechtgeist
    9870820,  #The Fall
    9105896,  #World Hero
    9954291,  #Vivified
    7586564,  #Straw Hat
    7404351,  #Hollow Depths
    10831617, #Elixir Born
    8145980,  #DMG
    9771722,  #Iffrean
    6395566,  #Submerzan
    8669733,  #Bolt Arc
    8172329,  #Harbringer
    5145725,  #Remnant
    9739014,  #Cryptr
    10219078, #Mortal Engine
    # 10168519, #Childream
    7635829,  #Skyraptor
    10269461, #Incindery
    # 10219776, #Zircon
    10447396, #Magma Force
    10489381, #Nebulence
    8083127,  #Mechanima
    9535496,  #Sweeper
    10234077, #Popping Prowess
    10514511, #Finflame
    8629407,  #Riftchaser
    # 9966961,  #Soul Sorceress
    10294169, #Alchemage
    3890554,  #Fireworks Girl
    10241137, #Inazuma Fighter
    9445676,  #Astromini
    10168519, #Childream
    10478670, #Und
    10659799, #Myriche
    9909767,  #Rev/Strider
    10219776, #Zircon
    9406958,  #Shikai
    8963869,  #Battle Cats
    10754814, #Gloomglow
    10794525, #Learned Wings
    10530739, #Sacrifall
    10885540, #Follow Wind
    8486364,  #Chibright
    9449834,  #Leechen
    
    #order shenanigans
    5713627,  #Yeet (Must be after Charismatic)
]
generics = [
    6353294,  #Generic Monsters I
    6353380,  #Generic Monsters II
    6353400,  #Generic Monsters III
    6353414,  #Generic Monsters IV
    6511321,  #Generic Monsters V
    6871713,  #Generic Monsters VI
    7193018,  #Generic Monsters VII
    7552348,  #Generic Monsters VIII
    7753395,  #Generic Monsters IX
    7934346,  #Generic Monsters X
    8202812,  #Generic Monsters XI
    8253171,  #Generic Monsters XII
    8318509,  #Generic Monsters XIII
    8487086,  #Generic Monsters XIV
    8540960,  #Generic Monsters XV
    8635701,  #Generic Monsters XVI
    8658932,  #Generic Monsters XVII
    8886344,  #Generic Monsters XVIII
    9389807,  #Generic Monsters XIX
    9607806,  #Generic Monsters XX
    10136453, #Generic Monsters XXI
    10333761, #Generic Monsters XXII
    10436336, #Generic Monsters XXIII
    10758460, #Generic Monsters XXIV
    10857434, #Generic Monsters XV
    6353430,  #Generic Spells
    6419184,  #Generic Spells II
    6871664,  #Generic Spells III
    7193014,  #Generic Spells IV
    7552464,  #Generic Spells V
    7934345,  #Generic Spells VI
    8886348,  #Generic Spells VII
    10436309, #Generic Spells VIII
    6353449,  #Generic Traps
    6598717,  #Generic Traps II
    7193016,  #Generic Traps III
    7759421,  #Generic Traps IV
    8886345,  #Generic Traps V
    10436312, #Generic Traps VI
    6353457,  #Assorted TCG Single Support
    6353465,  #Staples
    
    
    8362609,  #Anon's solos
] + [
    6532506,  #Alt Arts I
    10136457, #Alt Arts I
]
database += generics

support = [
    # assorted tcg support links
    8029982, 8031469, 8031504, 8030524, 8031637, 8030431,
    8031643, 8030556, 8031647, 8029971, 8030546, 8031613,
    8031649, 8030281, 8031513, 8031650, 8030151, 8029849,
    8031653, 8031657, 8031418, 8031526, 8031489, 8030255,
    8030476, 8031387, 8031368, 8030336, 8029833, 8030582,
    8031662, 8031570, 8031623, 8031664, 8030526, 8031668,
    8031380, 8031672, 8030158, 8030567, 8030222, 8031675,
    8030174, 8031679, 8030133, 8031693, 8031696, 8031699,
    8031703, 8031706, 8031622, 8031539, 8031413, 8030212,
    8029769, 8031144, 8031712, 8030464, 8031292, 8030585,
    8031802, 8031715, 8030165, 8031719, 8029963, 8030355,
    8031723, 8031587, 8031562, 8030322, 8030506, 8031730,
    8030303, 8030341, 8029975, 8029914, 8031733, 8030114,
    8031737, 8029860, 8029884, 8029920, 8030588, 8030532,
    8031740, 8030512, 8031742, 8031744, 8031746, 8030185,
    8031751, 8029985, 8030520, 8031400, 8031755, 8031426,
    8030109, 8031758, 8031765, 8031767, 8030541, 8030226,
    8030492, 8031776, 8031461, 8031778, 8031780, 8031783,
    8031173, 8029930, 8030246, 8031785, 8031185, 8031786,
    8031787, 8031071, 8031626, 8031792, 8030574, 8030560,
    8031796, 8031799, 8031800, 8030388, 8031135, 8030135,
    8031801, 8360633, 8361155, 8361317, 8361353, 8361385,
    8361563
]

banlist = [
    # 6358712,                    #Imported 1
    # 7260456,                    #Imported 2
    # 6751103,                    #Imported 3
    6358715,                      #Unimported
    
    5895579,                      #Retrains
    10525773, 10525774, 7000259,  #Banned
    5857248, 10525728,            #Limited
    5857281,                      #Semi-Limited
    5857285,                      #Unlimited
]

test = [
    # 7443406, #Illusory Rend test
] + banlist

beta = [
    7443406,  #BETA SINGLES, NEVER DELETE!
    ###################
    11019890, #Twin Polymerization
    10957934, #Pretzel's Link Pack
    10879519, #Anon's 8 Alt Arts
    10782154, #Pretzel's mini pack 7
    10370099, #Sentai Pt. 2
    ###################
    11032208, #Minion Hunter
    7432421,  #Fiendfyre
    10892283, #Canyon
    5150448,  #Sepulchre
    9439877,  #Ransomwear
    10974636, #Leviabyss
    10830386, #DJ Girl
    10155707, #Drowned Locker
    10756626, #Necristocrat
    10609802, #Animathos
    10794326, #Astral Legacy
    10485188, #Oniyaru
    6591476,  #Heart Pirate
    10674934, #Evernight
    10414701, #Divergence
    10254790, #Mervitralitta
    9779554,  #Dragonaire
    ###################
    11034871, #Paleo Support
    11026619, #FiM Support
    11006625, #RDA
    10998117, #Roid Support
    10971774, #Finflame Support
    9673459,  #Knightmare Retrains
    5192096,  #Phantasm Spiral Support
    10925034, #Ally of Justice Support
    10917540, #Sword Sanctuary support
    10863998, #Libromancer Support
    10875332, #Elixir Born Support
    10859018, #SPYRAL Support
    10846956, #Symphonic Warrior Support
    5619459,  #Contraption Support
    10572032, #Khremysis Support
]

# stungray flute format
sff = [
    8055759
]

format = "exu"

EXU_BANNED      = { "exu_limit" => 0 }
EXU_LIMITED     = { "exu_limit" => 1 }
EXU_SEMILIMITED = { "exu_limit" => 2 }
EXU_UNLIMITED   = { "exu_limit" => 3 }
EXU_RETRAIN     = { "exu_limit" => 3, "exu_retrain" => true }
EXU_IMPORT      = { "exu_limit" => 3, "exu_import" => true }
EXU_NO_IMPORT   = { "exu_limit" => 0, "exu_ban_import" => true }
EXU_ALT_ART     = { "alt_art" => true }
extra_info = {
    5895579  => EXU_RETRAIN,
    
    10525773 => EXU_BANNED,
    10525774 => EXU_BANNED,
    7000259  => EXU_BANNED,
    
    5857248  => EXU_LIMITED,
    10525728  => EXU_LIMITED,
    
    5857281  => EXU_SEMILIMITED,
    
    5857285  => EXU_UNLIMITED,
    
    # 6358712 => EXU_IMPORT,
    # 7260456 => EXU_IMPORT,
    # 6751103 => EXU_IMPORT,
    
    6358715 => EXU_NO_IMPORT,
    
    6532506 => EXU_ALT_ART,
}
extra_info_order = extra_info.keys.sort_by { |key| banlist.index(key) or -1 }

decks = nil
outname = nil

if operation == "main"
    decks = database
    outname = "db"
elsif operation == "banlist"
    decks = banlist
    outname = "banlist"
elsif operation == "support"
    decks = support
    outname = "support"
elsif operation == "beta"
    decks = beta
    outname = "beta"
elsif operation == "sff"
    decks = sff
    outname = "sff"
    format = "sff"
else
    decks = test
    outname = "test"
end

ignore_extra_info = ["test", "beta", "sff"]

decks += extra_info_order unless ignore_extra_info.include? operation

decks.uniq!

deck_count = decks.size

def progress(i, deck_count)
    max_size = 20
    ratio = i * max_size / deck_count
    bar = ("#" * ratio).ljust max_size
    puts "#{i}/#{deck_count} [#{bar}]"
end

def string_normalize(s)
    s.gsub(/[\r\n\t]/, "")
end

def approximately_equal(a, b)
    if String === a
        a = string_normalize a
        b = string_normalize b
    end
    a == b
end

now_time_ident = Time.now.strftime("#{outname}-%m-%d-%Y.%H.%M.%S")
now_time_name = "log/" + now_time_ident + ".txt"
$log_file = File.open(now_time_name, "w:UTF-8")

log "main", "Created log file #{now_time_name}"

old_database = get_database outname
date_added = get_database outname + "-date-added"
database = {}
counts = Hash.new 0
type_replace = /\(.*?This (?:card|monster)'s original Type is treated as (.+?) rather than (.+?)[,.].*?\)/
archetype_treatment = /\(.*This card is always treated as an? "(.+?)" card.*\)/
attr_checks = [
    "name",
    "effect",
    "pendulum_effect",
    "attribute",
    "scale",
    "atk",
    "def",
    "monster_color",
    "level",
    "arrows",
    "card_type",
    "ability",
    "custom",
    "type",
]
log "main", "Started scraping"

$session.visit("https://www.duelingbook.com")
$session.evaluate_script $comb_request_all

log "main", "Making ID requests"

$session.evaluate_script "DeckRequest.LoadAll(#{decks.to_json});"

log "main", "Finalizing ID requests"
$session.evaluate_script "DeckRequest.Finish();"

log "main", "Waiting for results"
results = loop do
    data = $session.evaluate_script "DeckRequest.GetResults();"
    if data["success"]
        if data["missed"] and not data["missed"].empty?
            log "main", "Could not read decklists: #{data["missed"]}"
        else
            log "main", "Successfully read all decklists"
        end
        break data["results"]
    elsif data["debug"]
        log "main", "Debug: #{data["debug"]}"
    end
    # if data["error"]
        # puts ">>>> Deck with id #{id} not found, moving on"
        # break []
    # end
end

changed_ids = []
results.each.with_index(1) { |(deck_id, cards), i|
    deck_id = deck_id.to_i
    info = extra_info[deck_id]
    log deck_id, "Starting to parse #{deck_id}"
    cards.each { |card|
        # reject proxy
        if card["type"] == "Proxy"
            next
        end
        
        # p date_added
        id = card["id"].to_s
        unless info.nil?
            card.merge! info
        end
        if type_replace === card["effect"]
            card["type"] = $1
        end
        if archetype_treatment === card["effect"]
            card["also_archetype"] = $1
        else
            card["also_archetype"] = nil
        end
        # get first addition date
        if card["tcg"] != 0 || card["ocg"] != 0
            card["date"] = nil
            da_info = date_added["added"][id] rescue nil
            if da_info.nil?
                if old_database[id]
                    card["date"] = old_database[id]["date"]
                end
            else
                card["date"] = da_info[0]
            end
        end
        
        # log operations
        display_text = "#{id} (#{card["name"]})"
        if database[id] and operation == "banlist"
            log deck_id, "warning: duplicate id #{display_text}"
        end
        if card["custom"] and card["custom"] > 1
            log deck_id, "warning: card id #{display_text} is not public"
        end
        if old_database[id]
            old_entry = old_database[id]
            attr_checks.each { |check|
                unless approximately_equal(old_entry[check], card[check])
                    changed_ids << id
                    if check == "custom"
                        mode = ["public", "private"][card[check] - 1]
                        log deck_id, "note: card id #{display_text} was made #{mode}"
                    else
                        log deck_id, "note: property '#{check}' of card id #{display_text} was changed"
                        log deck_id, "from: #{old_entry[check]}"
                        log deck_id, "to: #{card[check]}"
                    end
                end
            }
        else
            log deck_id, "note: [+] added new card #{display_text}"
        end
        
        database[id] ||= {}
        database[id].merge! card
        counts[id] += 1
        
        # not an extra archetype
        unless extra_info.include? deck_id
            if counts[id] > 1
                log deck_id, "warning: card id #{display_text} was duplicated in <#{deck_id}> from <#{database[id]["submission_source"]}>"
            end
            if operation == "support"
                unless database[id]["submission_source"].is_a? Array
                    database[id]["submission_source"] = [database[id]["submission_source"]].compact
                end
                database[id]["submission_source"] << deck_id
            else
                src = database[id]["submission_source"]
                if generics.include? src
                    deck_id ||= src
                    src = nil
                end
                database[id]["submission_source"] ||= deck_id
            end
        end
    }
    progress i, deck_count
    log deck_id, "Finished scraping."
}

log "main", "filling in missing #{format}_limit"
database.keys.each { |id|
    # cards are at 3 by default
    database[id]["#{format}_limit"] ||= 3
}

removed_ids = []

old_database.each { |id, card|
    unless database[id]
        log "main", "note: [-] removed old card #{id} (#{card && card["name"]})"
        removed_ids << id
    end
}

finish = Time.now

log "main", "Time elapsed: #{finish - start}s"

if note == "temp"
    scrape_info = JSON::parse File.read $SCRAPE_FILE
    scrape_info[now_time_ident] = {
        outname: outname,
        changed: changed_ids,
        removed: removed_ids,
    }
    Dir.mkdir "tmp" unless File.exists? "tmp"
    File.write "tmp/#{now_time_ident}.json", database.to_json
    File.write $SCRAPE_FILE, scrape_info.to_json
    puts "Complete scrape with:"
    puts "  finalize-scrape.rb \"#{now_time_ident}\""
else
    exit 1 unless interact_phase(old_database, database, changed_ids, removed_ids)
    puts "Press ENTER to confirm database entry."
    STDIN.gets
    File.write "#{outname}.json", database.to_json
end
$log_file.close