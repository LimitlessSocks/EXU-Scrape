// "scrape" editor
const listOfNamesToArrayFormat = (str) => {
    let map = new Map();
    for(let line of str.split(/\r?\n/)) {
        map.set(line.toLowerCase().trim(), { id: 0, name: line });
    }
    for(let [id, card] of Object.entries(CardViewer.Database.cards)) {
        // if(card.name.indexOf("Atlantean") !== -1) {
            // console.log(card.name, map.get(card.name));
        // }
        let key = card.name.toLowerCase();
        if(map.has(key) && map.get(key).id === 0) {
            map.set(key, { id: id, name: card.name });
        }
    }
    // console.log(map.get("Atlantean Attack Squad"));
    let s = "[\n";
    for(let [key, { name, id }] of map) {
        if(id !== 0) {
            s += `    ${(id + ",").padEnd(10)} // ${name}\n`;
        }
        else if(name[0] !== '#') {
            console.log("No such card:", name, id);
        }
    }
    s += "]";
    return s;
};

// (:card_\w+:\s*)+(.+?)\d+ :white_c
// 

const SFF_CARD_BANLIST = {
    3461: 1,    // Raigeki Break
};

const SFF_CARD_IDS = [
    5687,      // Dododo Bot
    6182,      // Dododo Witch
    5179,      // Dododo Warrior
    378,       // Beelze Frog
    1105,      // Des Frog
    3329,      // Poison Draw Frog
    4086,      // Submarine Frog
    4186,      // T.A.D.P.O.L.E.
    3547,      // Tradetoad
    4559,      // Unifrog
    910,       // D.3.S. Frog
    1006,      // Dark Mimic LV1
    1007,      // Dark Mimic LV3
    3834,      // Silent Magician LV4
    3835,      // Silent Magician LV8
    5433,      // Maestroke the Symphony Djinn
    6574,      // Humhumming the Key Djinn
    5430,      // Melomelody the Brass Djinn
    5432,      // Muzurhythm the String Djinn
    5431,      // Temtempo the Percussion Djinn
    1794,      // Gemini Summoner
    1554,      // Featherizer
    4124,      // Supervise
    1786,      // Gemini Booster
    5486,      // Atlantean Attack Squad
    5543,      // Atlantean Dragoons
    5532,      // Atlantean Heavy Infantry
    5531,      // Atlantean Marksman
    5533,      // Poseidra, the Atlantean Dragon
    286,       // Aussa the Earth Charmer
    1156,      // Dharc the Dark Charmer
    1460,      // Eria the Water Charmer
    2151,      // Hiita the Fire Charmer
    2640,      // Lyna the Light Charmer
    4838,      // Wynn the Wind Charmer
    3205,      // Ojama Yellow
    3196,      // Ojama Black
    3200,      // Ojama Green
    3202,      // Ojama Knight
    3198,      // Ojama Country
    3206,      // Ojamagic
    8484,      // Double Resonator
    1016,      // Dark Resonator
    1627,      // Flare Resonator
    5835,      // Gogogo Gigas
    1936,      // Gogogo Golem
    5187,      // Gogogo Giant
    6414,      // Number 55: Gogogo Goliath
    511,       // Blue-Eyes Toon Dragon
    4419,      // Toon Summoned Skull
    4418,      // Toon Mermaid
    2756,      // Manga Ryu-Ran
    4421,      // Toon World
    4639,      // Volcanic Blaster
    4640,      // Volcanic Counter
    4643,      // Volcanic Hammerer
    4647,      // Volcanic Rocket
    4649,      // Volcanic Shell
    4650,      // Volcanic Slicer
    4641,      // Volcanic Doomfire
    485,       // Blaze Accelerator
    4460,      // Tri-Blaze Accelerator
    4646,      // Volcanic Recharge
    3508,      // Red Gadget
    2024,      // Green Gadget
    4880,      // Yellow Gadget
    4079,      // Stronghold the Moving Fortress
    10333,     // Powerhold the Moving Battery
    5158,      // Constellar Aldebaran
    5294,      // Constellar Leonis
    5286,      // Constellar Kaus
    5159,      // Constellar Algiedi
    5675,      // Constellar Sombre
    5295,      // Constellar Acubens
    7037,      // Constellar Twinkle
    5343,      // Constellar Star Cradle
    5285,      // Constellar Praesepe
    5284,      // Constellar Ptolemy M7
    4581,      // V-Tiger Jet
    4840,      // X-Head Cannon
    4682,      // W-Wing Catapult
    4866,      // Y-Dragon Head
    4888,      // Z-Metal Tank
    4582,      // VW-Tiger Catapult
    4863,      // XZ-Tank Cannon
    4861,      // XY-Dragon Cannon
    4867,      // YZ-Tank Dragon
    4862,      // XYZ-Dragon Cannon
    4583,      // VWXYZ-Dragon Catapult Cannon
    8173,      // Union Hangar
    8175,      // Union Scramble
    2231,      // Infernity Avenger
    2234,      // Infernity Beetle
    5545,      // Mermail Abysspike
    5546,      // Mermail Abyssturge
    5987,      // Mermail Abyssbalaen
    1721,      // Gagaga Magician
    5186,      // Gagaga Girl
    5886,      // Gagaga Child
    6816,      // Gagaga Samurai
    6226,      // Gorgonic Gargoyle
    6227,      // Gorgonic Ghoul
    6228,      // Gorgonic Cerberus
    3299,      // Phantom Magician
    1365,      // Elemental HERO Bubbleman
    1417,      // Elemental HERO Woodsman
    1397,      // Elemental HERO Ocean
    1381,      // Elemental HERO Heat
    1385,      // Elemental HERO Lady Heat
    1391,      // Elemental HERO Necroshade
    1364,      // Elemental HERO Bladedge
    1374,      // Elemental HERO Flame Wingman
    1398,      // Elemental HERO Phoenix Enforcer
    1402,      // Elemental HERO Rampart Blaster
    1406,      // Elemental HERO Steam Healer
    1389,      // Elemental HERO Mudballman
    1412,      // Elemental HERO Thunder Giant
    1403,      // Elemental HERO Shining Flare Wingman
    1404,      // Elemental HERO Shining Phoenix Enforcer
    1409,      // Elemental HERO Tempest
    1388,      // Elemental HERO Mariner
    1390,      // Elemental HERO Necroid Shaman
    1414,      // Elemental HERO Wild Wingman
    1371,      // Elemental HERO Darkbright
    1383,      // Elemental HERO Inferno
    1396,      // Elemental HERO Nova Master
    1410,      // Elemental HERO Terra Firma
    1373,      // Elemental HERO Electrum
    56,        // Alchemist of Black Spells
    243,       // Armor Exe
    1084,      // Defender, the Magical Knight
    1188,      // Disenchanter
    1683,      // Frequency Magician
    2088,      // Hannibal Necromancer
    2692,      // Magical Plant Mandragola
    8265,      // Magical Something
    2710,      // Maiden of Macabre
    10046,     // Megistric Maginician
    9996,      // Rogue of Endymion
    213,       // Arcane Barrier
    5677,      // Spellbook Star Hall
    3318,      // Pitch-Black Power Stone
    9016,      // Mythical Bestiamorph
    3861,      // Skilled Dark Magician
    3862,      // Skilled White Magician
    7014,      // Skilled Blue Magician
    7496,      // Skilled Red Magician
    2900,      // Miracle Restoring
    3046,      // Mythical Beast Cerberus
    8965,      // Mythical Beast Jackal
    8968,      // Mythical Beast Bashilisk
    741,       // Cold Enchanter
    5609,      // Snowman Creator
    5318,      // Snow Dragon
    2207,      // Ice Master
    5316,      // Snowdust Dragon
    5627,      // Snowdust Giant
    1209,      // Doctor Cranium
    244,       // Armored Axon Kicker
    1581,      // Final Psychic Ogre
    3400,      // Psychic Lifetrancer
    2200,      // Hyper Psychic Blaster
    3396,      // Psychic Emperor
    3242,      // Overmind Archfiend
    3410,      // Serene Psychic Witch
    4993,      // Silent Psychic Wizard
    5038,      // D.D. Telepon
    3394,      // Esper Girl
    2836,      // Mental Seeker
    6112,      // Genomix Fighter
    1802,      // Genetic Woman
    2647,      // Machina Force
    751,       // Commander Covington
    2646,      // Machina Defender
    2651,      // Machina Sniper
    2652,      // Machina Soldier
    2650,      // Machina Peacekeeper
    2349,      // Junk Synchron
    4495,      // Turbo Synchron
    1294,      // Drill Synchron
    664,       // Changer Synchron
    3610,      // Road Synchron
    3153,      // Nitro Synchron
    3436,      // Quickdraw Synchron
    1661,      // Formula Synchron
    7094,      // Accel Synchron
    2346,      // Junk Forward
    2344,      // Junk Defender
    2338,      // Junk Archer
    2340,      // Junk Berserker
    2350,      // Junk Warrior
    888,       // Cyberdark Horn
    887,       // Cyberdark Edge
    890,       // Cyberdark Keel
    8765,      // Cyberdark Claw
    886,       // Cyberdark Dragon
    889,       // Cyberdark Impact!
    1729,      // Gaia The Fierce Knight
    842,       // Curse of Dragon
    4142,      // Swift Gaia the Fierce Knight
    7479,      // Charging Gaia the Fierce Knight
    10807,     // Soldier Gaia The Fierce Knight
    10884,     // Gaia the Fierce Knight Origin
    7812,      // Curse of Dragonfire
    3992,      // Spiral Spear Strike
    1728,      // Gaia the Dragon Champion
    7815,      // Sky Galloping Gaia the Dragon Champion
    385,       // Berfomet
    3292,      // Phantom Beast Wild-Horn
    3291,      // Phantom Beast Thunder-Pegasus
    3289,      // Phantom Beast Cross-Wing
    3290,      // Phantom Beast Rock-Lizard
    686,       // Chimera the Flying Mythical Beast
    7758,      // Paleozoic Eldonia
    7559,      // Paleozoic Hallucigenia
    7761,      // Paleozoic Leanchoilia
    7760,      // Paleozoic Marrella
    2352,      // Jurrac Aeolo
    2365,      // Jurrac Stauriko
    2353,      // Jurrac Brachis
    2354,      // Jurrac Dino
    2361,      // Jurrac Monoloph
    2359,      // Jurrac Iguanon
    2362,      // Jurrac Protops
    2364,      // Jurrac Spinos
    2369,      // Jurrac Velphito
    1295,      // Drill Warrior
    3155,      // Nitro Warrior
    4496,      // Turbo Warrior
    5537,      // Mighty Warrior
    5307,      // Gravity Warrior
    3708,      // Scarred Warrior
    3611,      // Road Warrior
    7825,      // Stardust Charge Warrior
    7556,      // Stardust Assault Warrior
    5020,      // Shark Stickers
    5374,      // Hammer Shark
    6202,      // Saber Shark
    6196,      // Double Fin Shark
    5697,      // Double Shark
    5695,      // Spear Shark
    2843,      // Metabo-Shark
    876,       // Cyber Shark
    5848,      // Panther Shark
    5850,      // Eagle Shark
    6194,      // Depth Shark
    5100,      // Submersible Carrier Aero Shark
    5811,      // Number 47: Nightmare Shark
    7827,      // Number 37: Hope Woven Dragon Spider Shark
    5386,      // Number 32: Shark Drake
    5620,      // Number C32: Shark Drake Veiss
    3431,      // Queen's Knight
    2438,      // King's Knight
    2305,      // Jack's Knight
    9599,      // Valkyrie Zweite
    9600,      // Valkyrie Erste
    9601,      // Valkyrie Brunhilde
    9602,      // Fortune Chariot
    9919,      // Valkyrie Vierte
    10100,     // Valkyrie Funfte
    10101,     // Valkyrie Erda
    10102,     // Valkyrie Chariot
    10104,     // Pegasus Wing
    9606,      // Goddess Verdande's Guidance
    9607,      // Goddess Urd's Verdict
    9921,      // Apple of Enlightenment
    64,        // Alien Hypno
    159,       // Ancient Gear Knight
    197,       // Aquarian Alessa
    487,       // Blazewing Butterfly
    8203,      // Chemicritter Carbo Crab
    8202,      // Chemicritter Hydron Hawk
    8204,      // Chemicritter Oxy Ox
    702,       // Chthonian Emperor Dragon
    815,       // Crusader of Endymion
    1035,      // Dark Valkyria
    1065,      // Dawnbreak Gardna
    1220,      // Doom Shaman
    8822,      // Duck Dummy
    1394,      // Elemental HERO Neos Alius
    1485,      // Evocator Chevalier
    10369,     // Evocator Eveque
    1713,      // Future Samurai
    1770,      // Gem-Knight Amber
    1778,      // Gem-Knight Iolite
    5153,      // Gem-Knight Sardonyx
    1790,      // Gemini Lancer
    1792,      // Gemini Soldier
    1934,      // Goggle Golem
    1975,      // Grasschopper
    6961,      // Heavy Knight of the Flame
    5461,      // Hieratic Seal of the Dragon King
    2212,      // Il Blud
    2257,      // Infinity Dark
    2432,      // King Pyron
    6111,      // Knight Day Grepher
    2630,      // Lucky Pied Piper
    2693,      // Magical Reflect Slime
    8207,      // Meteor Dragon Red-Eyes Impact
    3296,      // Phantom Dragonray Bronto
    8205,      // Poly-Chemicritter Dioxogre
    8206,      // Poly-Chemicritter Hydragon
    7273,      // Red-Eyes Black Flare Dragon
    3779,      // Shadow Delver
    6110,      // Skelesaurus
    4486,      // Tuned Magician
    7025,      // Marmiting Captain
    5244,      // Evilswarm Thanatos
    2343,      // Junk Collector
    8131,      // Number 59: Crooked Cook
    6294,      // Ghostrick Dullahan
    4508,      // Twin Swords of Flashing Light - Tryce
    8421,      // Aleister the Invoker
    8430,      // Invocation
    673,       // Chaos King Archfiend
    486,       // Blaze Fenix, the Burning Bombardment Bird
    1186,      // Disciple of the Forbidden Spell
    988,       // Dark Grepher
    4347,      // The Tricky
    6138,      // Pot of Dichotomy
    8129,      // Number 45: Crumble Logos the Prophet of Demolition
    11071,     // Gluttonous Reptolphin Greethys
    770,       // Convulsion of Nature
    10291,     // Mathmech Addition
    9804,      // Firebrand Hymnist
    5317,      // Beetron
    10424,     // Cross-Sheep
    36,        // Acid Trap Hole
    3685,      // Salvage Warrior
    6538,      // Samsara, Dragon of Rebirth
    6926,      // Primitive Butterfly
    1939,      // Gokipon
    951,       // Danipon
    7754,      // Painful Escape
    9421,      // Astra Ghouls
    12008,     // Noble Knight's Spearholder
    1760,      // Gearfried the Iron Knight
    482,       // Blast with Chain
    6777,      // Scrounging Goblin
    5628,      // Gagagigo the Risen
    4595,      // Vanguard of the Dragon
    6470,      // Blue Dragon Summoner
    156,       // Ancient Gear Gadjiltron Chimera
    5724,      // Star Drawing
    3496,      // Reaper of the Cards
    4661,      // Vylon Delta
    9175,      // Fire Fighting Daruma Doll
    4181,      // Synchron Explorer
    5497,      // Fairy King Albverdich
    4911,      // Zone Eater
    4170,      // Synchro Boost
    10408,     // Squeaknight
    2666,      // Mad Reloader
    1823,      // Genex Neutron
    4312,      // The Legendary Fisherman
    9023,      // Oops!
    2487,      // Kuriboh
    1946,      // Golden Ladybug
    3461,      // Raigeki Break
    5116,      // Black Ray Lancer
    4407,      // Toll
    5689,      // Bacon Saver
    5095,      // Number 39: Utopia
    5069,      // Space Cyclone
    3336,      // Polymerization
    207,       // Arcana Force XIV - Temperance
    4289,      // The Flute of Summoning Kuriboh
    8886,      // Linkuriboh
    5115,      // Baby Tiragon
    1843,      // Giant Germ
    2772,      // Mask of Darkness
    4300,      // The Hunter with 7 Weapons
    5225,      // Chachaka Archer
    4235,      // Terraforming
    7120,      // Dragong
    9024,      // Hallohallo
    7121,      // Mandragon
    7855,      // Performapal Odd-Eyes Light Phoenix
    1998,      // Gravelstorm
    689,       // Chiron the Mage
    1233,      // Double Cyclone
    1311,      // Dust Tornado
    617,       // Card Trader
    3682,      // Sakuretsu Armor
    7219,      // Abyss Stungray
    6883,      // Quantum Cat
    6882,      // Swamp Mirrorer
    5962,      // Shapesister
    1707,      // Fusion Sage
    3959,      // Speed Warrior
    1494,      // Exiled Force
    3903,      // Snipe Hunter
    5514,      // Compulsory Escape Device
    2081,      // Hand Destruction
    8259,      // Present Card
    1055,      // Darkness Approaches
    5796,      // Armored Kappa
    5114,      // Shining Elf
    58,        // Alector, Sovereign of Birds
    4132,      // Susa Soldier
    6108,      // Aratama
    2709,      // Maharaghi
    3233,      // Otohime
    1108,      // Des Lacooda
    17,        // A Legendary Ocean
    5606,      // Abyss Warrior
    2680,      // Magical Arm Shield
    1099,      // Depth Amulet
    9273,      // Cyberse White Hat
    7,         // 7
    4509,      // Twin-Barrel Dragon
    324,       // Barrel Dragon
    15,        // A Hero Emerges
    2954,      // Monster Reincarnation
    7216,      // Jar of Avarice
    8458,      // Power Wall
    8065,      // Marshmacaron
    10060,     // Baba Barber
    2443,      // Knight of the Red Lotus
    414,       // Birthright
    1561,      // Field-Commander Rahz
    4445,      // Trap Hole
    3703,      // Sauropod Brachion
    3953,      // Spawn Alligator
    4117,      // Super-Ancient Dinobeast
    4243,      // Teva
    3849,      // Sinister Serpent
    4409,      // Tongue Twister
    2328,      // Jirai Gumo
    1680,      // Freed the Matchless General
    8826,      // Fantastic Striborg
    8868,      // Broken Line
    3344,      // Pot of Duality
    2721,      // Majestic Mech - Ohka
    4692,      // Warm Worm
    296,       // Aztekipede, the Worm Warrior
    3103,      // Needle Worm
    3799,      // Shield Worm
    6525,      // Resonance Insect
    270,       // Assault on GHQ
    973,       // Dark Diviner
    545,       // Brain Crusher
    481,       // Blast Sphere
    3212,      // One for One
    1579,      // Final Destiny
    4590,      // Vampire Lord
    7100,      // Absolute King Back Jack
    2293,      // Iron Chain Dragon
    1981,      // Gravedigger Ghoul
    1090,      // Delg the Dark Monarch
    4365,      // Thestalos the Firestorm Monarch
    7821,      // Angmarl the Fiendish Monarch
    1971,      // Granmarg the Rock Monarch
    2129,      // Herculean Power
    3934,      // Soul Release
    1991,      // Gravekeeper's Servant
    2751,      // Man-Eater Bug
    2699,      // Magician of Faith
    168,       // Ancient Rules
    9096,      // LANphorhynchus
    9095,      // Traffic Ghost
    417,       // Black Brutdrago
    500,       // Block Attack
    4067,      // Stop Defense
    4346,      // The Transmigration Prophecy
    2679,      // Magical Android
    1726,      // Gaia Power
    4552,      // Umiiruka
    2634,      // Luminous Spark
    2942,      // Molten Destruction
    3598,      // Rising Air Current
    3026,      // Mystic Plasma Zone
    1219,      // Doom Dozer
    4739,      // Wetlands
    9513,      // Agave Dragon
    3469,      // Rainbow Life
    1018,      // Dark Ruler Ha Des
    2813,      // Mefist the Infernal General
    4268,      // The Dragon Dwelling in the Deep
    6878,      // Card Advance
    3794,      // Shield & Sword
    4382,      // Thunder Dragon
    4304,      // The Inexperienced Spy
    4512,      // Twin-Headed Thunder Dragon
    2155,      // Hiro's Shadow Scout
    3531,      // Reinforce Truth
    11,        // A Cat of Ill Omen
    1143,      // Destruct Potion
    960,       // Dark Bug
    1951,      // Good Goblin Housekeeping
    1962,      // Graceful Dice
    3866,      // Skull Dice
    3790,      // Share the Pain
    7123,      // Tatsunoko
    6329,      // Blackfeather Darkrage Dragon
    834,       // Crystal Seer
    5917,      // Underworld Fighter Balmung
    3711,      // Scrap Archfiend
    5916,      // Mist Bird Clausolas
    733,       // Cockroach Knight
    6455,      // Cairngorgon, Antiluminescent Knight
    5683,      // Slushy
    1500,      // Explosive Magician
    1754,      // Gather Your Mind
    6526,      // Breaker the Dark Magical Warrior
    6039,      // Number 44: Sky Pegasus
    5096,      // Number 17: Leviathan Dragon
    5109,      // Kachi Kochi Dragon
    5498,      // Sword Breaker
    5679,      // Giant Soldier of Steel
    2290,      // Iron Blacksmith Kotetsu
    3018,      // Mysterious Puppeteer
    2509,      // Laser Cannon Armor
    2553,      // Legendary Sword
    2655,      // Machine Conversion Factory
    3037,      // Mystical Moon
    3362,      // Power of Kaishin
    3474,      // Raise Body Heat
    4629,      // Violet Crystal
    362,       // Beast Fangs
    529,       // Book of Secret Arts
    979,       // Dark Energy
    1254,      // Dragon Treasure
    1348,      // Electro-Whip
    1646,      // Follow Wind
    4625,      // Vile Germs
    3920,      // Sonic Bird
    3767,      // Senju of the Thousand Hands
    4801,      // Woodland Archer
    8064,      // Sentry Soldier of Stone
    581,       // Burning Spear
    2059,      // Gust Fan
    4047,      // Steel Shell
    2287,      // Invigoration
    4150,      // Sword of Dark Destruction
    1423,      // Elf's Light
    2255,      // Infinite Cards
    5143,      // Number 12: Crimson Shadow Armor Ninja
    5126,      // Number 19: Freezadon
    5493,      // Number 33: Chronomaly Machu Mech
    8588,      // Number 28: Titanic Moth
    7706,      // Aegaion the Sea Castrum
    282,       // Attack and Receive
    3175,      // Numinous Healer
    1292,      // Drill Barnacle
    1596,      // Firewall
    5551,      // Lemuria, the Forgotten City
    4668,      // Vylon Ohm
    2184,      // Hungry Burger
    2078,      // Hamburger Recipe
    4183,      // Synthesis Spell
    2638,      // Lycanthrope
    8943,      // Linkerbell
    7255,      // Risebell the Summoner
    6117,      // Risebell the Star Psycher
    5877,      // Risebell the Star Adjuster
    4704,      // Water Hazard
    5615,      // Mecha Sea Dragon Plesion
    6338,      // Tri-Edge Levia
    2075,      // Half Shut
    8760,      // The Legendary Fisherman II
    1704,      // Fusion Gate
    3138,      // Night's End Sorcerer
    5484,      // Dust Knight
    5614,      // Shore Knight
    5720,      // Brushfire Knight
    5791,      // Altitude Knight
    6434,      // Dawn Knight
    1200,      // Divine Sword - Phoenix Blade
    5763,      // Noble Arms - Caliburn
    3351,      // Power Breaker
    1867,      // Gilford the Legend
    2684,      // Magical Exemplar
    5659,      // Starliege Paladynamo
    1594,      // Fires of Doomsday
    4084,      // Stygian Sergeants
    4085,      // Stygian Street Patrol
    2601,      // Limit Reverse
    271,       // Astral Barrier
    6812,      // Fusion Reserve
    4655,      // Vortex Trooper
    2817,      // Megarock Dragon
    5678,      // Attack the Moon!
    3621,      // Rock Bombardment
    5507,      // Catapult Zone
    5496,      // Soul of Silvermountain
    6585,      // Flash Fusion
    4578,      // Urgent Tuning
    7928,      // Wonder Xyz
    3062,      // Naturia Cosmobeet
    4262,      // The Creator
    7538,      // Urgent Ritual Art
    1431,      // Emergency Provisions
    5064,      // Shard of Greed
    6459,      // Electromagnetic Turtle
    3333,      // Poki Draco
    647,       // Chain Destruction
    2687,      // Magical Hats
    3630,      // Rod of the Mind's Eye
    4146,      // Swing of Memories
    614,       // Card Guard
    2677,      // Magic Reflector
    5358,      // Iron Call
    3261,      // Paralyzing Potion
    1165,      // Different Dimension Capsule
    1115,      // Desert Twister
    1689,      // Frost and Flame Dragon
    3981,      // Sphere of Chaos
    4392,      // Tiki Soul
    8079,      // Metamorphortress
    2658,      // Machine King - 3000 B.C.
    1427,      // Embodiment of Apophis
    8073,      // Dimension Reflector
    1613,      // Flame Swordsman
    8609,      // Link Spider
    2211,      // Ignition Beast Volcannon
    4999,      // Vampire Dragon
    4490,      // Tuning
    6192,      // Blue Flame Swordsman
    5389,      // Photon Papilloperative
    5099,      // Number 10: Illumiknight
    5814,      // Fairy Cheer Girl
    6962,      // BOXer
    4075,      // Strike Ninja
    5152,      // Number C39: Utopia Ray
    5775,      // Power Tool Mecha Dragon
    6295,      // Alsei, the Sylvan High Protector
    6052,      // Comics Hero King Arthur
    1010,      // Dark Nephthys
    1835,      // Germ Infection
    5495,      // Alchemic Magician
    8099,      // Nirvana High Paladin
    3687,      // Samsara Kaiser
    531,       // Boost Warrior
    6131,      // Giganticastle
    7546,      // Black Luster Soldier - Sacred Soldier
    2339,      // Junk Barrage
    5808,      // Infernal Flame Vixen
    2345,      // Junk Destroyer
    253,       // Armory Arm
    2057,      // Gungnir, Dragon of the Ice Barrier
    760,       // Conscription
    8157,      // Tribute Burial
    1002,      // Dark Magician Girl
    3438,      // Quillbolt Hedgehog
    78,        // Alligator's Sword Dragon
    5633,      // Mono Synchron
    3997,      // Spirit Force
    1288,      // Dread Dragon
    9931,      // Dark Magic Twin Burst
    618,       // Card Trooper
    4491,      // Tuningware
    4354,      // The Warrior Returning Alive
    6480,      // Mathematician
    1094,      // Delta Flyer
    5111,      // Number 20: Giga-Brilliant
    805,       // Blood Mefist
    2602,      // Limiter Overload
    611,       // Card Breaker
    178,       // Anteatereatingant
    4975,      // Celestial Wolf Lord, Blue Sirius
    1155,      // Dewloren, Tiger King of the Ice Barrier
    1724,      // Gaia Knight, the Force of Earth
    6356,      // Powered Inzektron
    1236,      // Double Summon
    7375,      // Roulette Spider
    2700,      // Magician's Circle
    1663,      // Fortress Warrior
    2629,      // Lucky Iron Axe
    2269,      // Insect Queen
    5820,      // Ice Beast Zerofyne
    1562,      // Fiend Comedian
    5909,      // Number 66: Master Key Beetle
    1499,      // Exploder Dragonwing
    6105,      // Pumprincess the Princess of Ghosts
    7407,      // Caninetaur
    4616,      // Verdant Sanctuary
    3590,      // Rigorous Reaver
    3888,      // Slate Warrior
    7128,      // Mischief of the Gnomes
    893,       // Cybernetic Magician
    9152,      // Watch Cat
    4138,      // Swarm of Locusts
    8366,      // Heavy Armored Train Ironwolf
    10059,     // Defender of the Labyrinth
    7513,      // Shuffle Reborn
    2590,      // Lightforce Sword
    3262,      // Parasite Paracide
    616,       // Card Shuffle
    3587,      // Ribbon of Rebirth
    5381,      // Nitwit Outwit
    4302,      // The Immortal Bushi
    5690,      // Amarylease
    2124,      // Herald of Creation
    6045,      // Number 85: Crazy Box
    8006,      // Wrecker Panda
    9374,      // Orgoth the Relentless
    731,       // Cobra Jar
    6203,      // Silent Angler
    6200,      // Number 73: Abyss Splash
    10244,     // Seraphim Papillion
    6321,      // Pilgrim Reaper
    1112,      // Descending Lost Star
    1039,      // Dark World Dealings
    10271,     // Peaceful Burial
    1031,      // Dark Strike Fighter
    4296,      // The Golden Apples
    3025,      // Mystic Piper
    3860,      // Skill Successor
    2689,      // Magical Mallet
    3542,      // Reload
    6164,      // Tour Bus To Forbidden Realms
    5762,      // Dimension Gate
    437,       // Black-Winged Dragon
    2580,      // Light End Dragon
    585,       // Buster Blader
    3797,      // Shield Warrior
    8062,      // Counter Gate
    10292,     // Mathmech Subtraction
    1416,      // Elemental HERO Wildheart
    1190,      // Diskblade Rider
    678,       // Chaosrider Gustaph
    359,       // Bazoo the Soul-Eater
    919,       // D.D. Scout Plane
    4904,      // Zoma the Spirit
    139,       // Anarchist Monk Ranshin
    5098,      // Gachi Gachi Gantetsu
    3224,      // Orca Mega-Fortress of Darkness
    4428,      // Torpedo Fish
    607,       // Cannonball Spear Shellfish
    4879,      // Yellow Baboon, Archer of the Forest
    23,        // A/D Changer
    749,       // Combo Master
    1082,      // Deepsea Warrior
    2289,      // Iris, the Earth Mother
    2306,      // Jade Insect Whistle
    2792,      // Mataza the Zapper
    5118,      // Lavalval Ignis
    10003,     // Decode Talker Extended
    5974,      // Transmodify
    9006,      // Downbeat
    1047,      // Darkfire Dragon
    1710,      // Fusionist
    1608,      // Flame Ghost
    4522,      // Two-Pronged Attack
    7550,      // Relinkuriboh
    5998,      //Castle of Dragon Souls
    757,       //Comrade Swordsman of Landstar
    8972,      //Grappler Angler
    2373,      //Jutte Fighter
    3641,      //Rose, Warrior of Revenge
    3690,      //Samurai of the Ice Barrier
    12223,     //Night's End Administrator
    309,       //Backup Warrior
    737,       //Cocoon of Evolution
    2507,      //Larvae Moth
    11591,     //Amabie
    9269,      //Shooting Riser Dragon
    11616,     //Synchro Transmission
    4566,      //Unknown Synchron
    9117,      //Righty Driver
    3141,      //Nightmare Penguin
    3509,      //Red Medicine
    11537,     //Dark Eye Nightmare
    8045,      //Celtic Guard of Noble Arms
    1261,      //Dragonic Guard
    4175,      //Synchro Fusionist
    10536,     //Crystal Girl
    4696,      //Warrior of Atlantis
    5379,      //Flame Tiger
    2483,      //Kunai With Chain
    3777,      //Seven Swords Warrior
    2596,      //Lightning Warrior
    9083,      //Aleister the Invoker of Madness
    7953,      //Performapal Swincobra
    4246,      //The A. Forces
    1723,      //Gaia Drake, the Universal Force
    1244,      //Dragon Knight Draco-Equiste
    677,       //Chaos-End Master
    10890,     //Necroquip Prism
    10442,     //Disposable Learner Device
    279,       //Attack Gainer
    4149,      //Sword Master
    7561,      //Paleozoic Pikaia
    5913,      //Herald of Pure Light
    6225,      //Gorgonic Golem
    981,       //Dark Eruption
    5274,      //Creeping Darkness
    426,       //Black Pendant
    4572,      //Unstable Evolution
    5740,      //The Big Cattle Drive
    381,       //Behemoth, the King of All Animals
    2889,      //Minoan Centaur
    7540,      //First Aid Squad
    8973,      //Mahjong Munia Maidens
    2996,      //Mosaic Manticore
    5988,      //Trifortressops
    5352,      //Gearspring Spirit
    4900,      //Zero Gravity
    3372,      //Prickle Fairy
    1449,      //Energy Drain
    5509,      //Impenetrable Attack
    2110,      //Healing Wave Generator
    6201,      //Number 94: Crystalzero
    3973,      //Spell Striker
    9064,      //Masterking Archfiend
    7218,      //Fiend Griefing
    2384,      //Kaiser Glider
    5241,      //Divine Dragon Apocralyph
    7427,      //Legion the Fiend Jester
    11307,     //Tilted Try
    4431,      //Totem Dragon
    4128,      //Supreme Arcanite Magician
    3606,      //Ritual Weapon
    3524,      //Reflect Bounder
    9951,      //Infinitrack River Stormer
    1800,      //Generation Shift
    3134,      //Next to Be Lost
    9345,      //Cross Breed
    10257,     //Bownty
    1862,      //Gigaplant  
];
