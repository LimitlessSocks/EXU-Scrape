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

const BFYF_CARD_BANLIST = {
    3461: 1,    // Raigeki Break
};

const BFYF_CARD_IDS = [
    1721,      // Gagaga Magician
    5186,      // Gagaga Girl
    5886,      // Gagaga Child
    3508,      // Red Gadget
    2024,      // Green Gadget
    4880,      // Yellow Gadget
    4079,      // Stronghold the Moving Fortress
    5687,      // Dododo Bot
    6182,      // Dododo Witch
    5179,      // Dododo Warrior
    1365,      // Elemental HERO Bubbleman
    1417,      // Elemental HERO Woodsman
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
    7758,      // Paleozoic Eldonia
    7559,      // Paleozoic Hallucigenia
    7761,      // Paleozoic Leanchoilia
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
    2349,      // Junk Synchron
    3959,      // Speed Warrior
    2350,      // Junk Warrior
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
    664,       // Changer Synchron
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
    6816,      // Gagaga Samurai
    5020,      // Shark Stickers
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
    1661,      // Formula Synchron
    2255,      // Infinite Cards
    5143,      // Number 12: Crimson Shadow Armor Ninja
    5126,      // Number 19: Freezadon
    5493,      // Number 33: Chronomaly Machu Mech
    8588,      // Number 28: Titanic Moth
    741,       // Cold Enchanter
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
    1397,      // Elemental HERO Ocean
    1396,      // Elemental HERO Nova Master
    1410,      // Elemental HERO Terra Firma
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
];