// "scrape" editor
const listOfNamesToArrayFormat = (str) => {
    let map = new Map();
    for(let line of str.split(/\r?\n/)) {
        map.set(line, 0);
    }
    for(let [id, card] of Object.entries(CardViewer.Database.cards)) {
        if(map.get(card.name) === 0) {
            map.set(card.name, id);
        }
    }
    let s = "[\n";
    for(let [name, id] of map) {
        if(id !== 0) {
            s += `    ${(id + ",").padEnd(10)} // ${name}\n`;
        }
    }
    s += "]";
    return s;
};

const BFYF_CARD_IDS = [
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
    3205,      // Ojama Yellow
    3196,      // Ojama Black
    3200,      // Ojama Green
];