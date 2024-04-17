// testing harness here for now
const { parseRequirements } = require("./../can-summon.js");
const { objectEqual } = require("./lib.js");
const util = require("util");
const TEST_CASES = [
    {
        input: `1 Tuner + 1+ non-Tuner monsters`,
        expected: {
            components: [
                { query: "Tuner", minimum: 1, maximum: 1 },
                { query: "non-Tuner monsters", minimum: 1, maximum: null },
            ],
        },
    },
    {
        input: `"Absalom, the Caterpillar of Riddles" + 1+ non-Tuner Insect monsters`,
        expected: {
            components: [
                { query: `"Absalom, the Caterpillar of Riddles"`, minimum: 1, maximum: 1 },
                { query: `non-Tuner Insect monsters`, minimum: 1, maximum: null },
            ],
        }
    },
    {
        input: `"Neinsect AV2" + 1+ non-Tuner monster(s)`,
        expected: {
            components: [
                { query: `"Neinsect AV2"`, minimum: 1, maximum: 1 },
                { query: "non-Tuner monster(s)", minimum: 1, maximum: null },
            ],
        },
    },
    {
        input: `1 "Nine-Tailed" Tuner + 1+ non-Tuner monsters`,
        expected: {
            components: [
                { query: `"Nine-Tailed" Tuner`, minimum: 1, maximum: 1 },
                { query: "non-Tuner monsters", minimum: 1, maximum: null },
            ],
        },
    },
    {
        input: `1 or 2 Tuners + 1+ non-Tuner monsters`,
        expected: {
            components: [
                { query: "Tuners", any_of: [1, 2] },
                { query: "non-Tuner monsters", minimum: 1, maximum: null },
            ],
        },
    },
    {
        input: `"Plaguespreader Zombie" + 2+ non-Tuner Zombie monsters`,
        expected: {
            components: [
                { query: `"Plaguespreader Zombie"`, minimum: 1, maximum: 1 },
                { query: `non-Tuner Zombie monsters`, minimum: 2, maximum: null },
            ],
        },
    },
    {
        input: `2 Tuners + 1 non-Tuner DARK Dragon Synchro Monster`,
        expected: {
            components: [
                { query: "Tuners", minimum: 2, maximum: 2 },
                { query: "non-Tuner DARK Dragon Synchro Monster", minimum: 1, maximum: 1 },
            ],
        },
    },
    {
        input: `2 Tuner monsters, including a Tuner Synchro Monster + 1 non-Tuner monster`,
        expected: {
            components: [
                { query: "Tuner monsters", minimum: 1, maximum: 1 },
                { query: "(Tuner monsters) AND (Tuner Synchro Monster)", minimum: 1, maximum: 1 },
                { query: "non-Tuner monster", minimum: 1, maximum: 1 },
            ],
        },
    },
    {
        input: `3+ Tuner monsters, including a Tuner Synchro Monster + 2+ non-Tuner monsters`,
        expected: {
            components: [
                { query: "Tuner monsters", minimum: 2, maximum: null },
                { query: "(Tuner monsters) AND (Tuner Synchro Monster)", minimum: 1, maximum: 1 },
                { query: "non-Tuner monsters", minimum: 2, maximum: null },
            ],
        },
    },
    {
        input: `1 Tuner + 1+ monsters including a Tuner`,
        expected: {
            components: [
                { query: "Tuner", minimum: 1, maximum: 1 },
                { query: "monsters", minimum: 0, maximum: null, },
                { query: "(monsters) AND (Tuner)", minimum: 1, maximum: 1, },
            ],
        },
    },
    {
        input: `1 Tuner + 1+ non-Tuner monsters including 2+ WATER monsters`,
        expected: {
            components: [
                { query: "Tuner", minimum: 1, maximum: 1 },
                { query: "non-Tuner monsters", minimum: 0, maximum: null },
                { query: "(non-Tuner monsters) AND (WATER monsters)", minimum: 2, maximum: 2 },
            ],
        },
    },
    {
        input: `1 Tuner + 3+ non-Tuner monsters including 2+ WATER monsters`,
        expected: {
            components: [
                { query: "Tuner", minimum: 1, maximum: 1 },
                { query: "non-Tuner monsters", minimum: 1, maximum: null },
                { query: "(non-Tuner monsters) AND (WATER monsters)", minimum: 2, maximum: 2 },
            ],
        },
    },
    {
        input: `1 Tuner + 1+ non-Tuner monsters including exactly 1 WATER monster`,
        expected: {
            components: [
                { query: "Tuner", minimum: 1, maximum: 1 },
                { query: "(non-Tuner monsters) AND NOT (WATER monster)", minimum: 0, maximum: null },
                { query: "(non-Tuner monsters) AND (WATER monster)", minimum: 1, maximum: 1 },
            ],
        },
    },
    {
        input: `1 Tuner + 3+ non-Tuner monsters including exactly 2 WATER monsters`,
        expected: {
            components: [
                { query: "Tuner", minimum: 1, maximum: 1 },
                { query: "(non-Tuner monsters) AND NOT (WATER monsters)", minimum: 1, maximum: null },
                { query: "(non-Tuner monsters) AND (WATER monsters)", minimum: 2, maximum: 2 },
            ],
        },
    },
    {
        input: `1 "Air Essences" Tuner + 1 non-Tuner monster`,
        expected: {
            components: [
                { query: `"Air Essences" Tuner`, minimum: 1, maximum: 1 },
                { query: `non-Tuner monster`, minimum: 1, maximum: 1 },
            ],
        },
    },
    {
        input: `"Blood Quartz" + 1+ non-Tuner monsters`,
        expected: {
            components: [
                { query: `"Blood Quartz"`, minimum: 1, maximum: 1 },
                { query: `non-Tuner monsters`, minimum: 1, maximum: null },
            ],
        },
    },
    {
        input: `"FiM Keys of Harmony" + "FiM Applejack, Pony of Honesty"`,
        expected: {
            components: [
                { query: `"FiM Keys of Harmony"`, minimum: 1, maximum: 1 },
                { query: `"FiM Applejack, Pony of Honesty"`, minimum: 1, maximum: 1 },
            ],
        },
    },
    {
        input: `"Majestic Dragon" + 1+ non-Tuner monsters, including a Dragon Synchro Monster`,
        expected: {
            components: [
                { query: `"Majestic Dragon"`, minimum: 1, maximum: 1 },
                { query: "non-Tuner monsters", minimum: 0, maximum: null },
                { query: "(non-Tuner monsters) AND (Dragon Synchro Monster)", minimum: 1, maximum: 1 },
            ],
        },
    },
    {
        input: `1 "Bubblebeaut" Tuner Synchro Monster + 1+ non-Tuner "Bubblebeaut" Synchro Monsters`,
        expected: {
            components: [
                { query: `"Bubblebeaut" Tuner Synchro Monster`, minimum: 1, maximum: 1 },
                { query: `non-Tuner "Bubblebeaut" Synchro Monsters`, minimum: 1, maximum: null },
            ],
        },
    },
    {
        input: `1 "Nine-Tailed" Tuner + 1 "Fox Token"`,
        expected: {
            components: [
                { query: `"Nine-Tailed" Tuner`, minimum: 1, maximum: 1 },
                { query: `"Fox Token"`, minimum: 1, maximum: 1 },
            ],
        },
    },
    {
        input: `1 "Speedroid" Tuner + 1 WIND non-Tuner monster`,
        expected: {
            components: [
                { query: `"Speedroid" Tuner`, minimum: 1, maximum: 1 },
                { query: `WIND non-Tuner monster`, minimum: 1, maximum: 1 },
            ],
        },
    },
    {
        input: `1 DARK Synchro Tuner + 1 non-Tuner DARK monster`,
        expected: {
            components: [
                { query: `DARK Synchro Tuner`, minimum: 1, maximum: 1 },
                { query: `non-Tuner DARK monster`, minimum: 1, maximum: 1 },
            ],
        },
    },
    // NOTE: this will have issues as intended
    // non-Tuner "Bucket Squad" or "roid" monster -> (non-Tuner "Bucket Squad") or ("roid" monster)
    // versus what is intended, non-Tuner ("Bucket Squad" or "roid") monster

    {
        input: `1 Level 4 FIRE Tuner + 1 non-Tuner "Bucket Squad" or "roid" monster`,
        expected: {
            components: [
                { query: `Level 4 FIRE Tuner`, minimum: 1, maximum: 1 },
                { query: `non-Tuner "Bucket Squad" or "roid" monster`, minimum: 1, maximum: 1 },
            ],
        },
    },
    
    {
        input: `3 WATER monsters`,
        expected: {
            components: [
                { query: `WATER monsters`, minimum: 3, maximum: 3 },
            ],
        },
    },
    {
        input: `2+ Winged Beast monsters`,
        expected: {
            components: [
                { query: `Winged Beast monsters`, minimum: 2, maximum: null },
            ],
        },
    },
    {
        input: `"Cyber Dragon" + "Cyber Dragon"`,
        expected: {
            components: [
                { query: `"Cyber Dragon"`, minimum: 1, maximum: 1 },
                { query: `"Cyber Dragon"`, minimum: 1, maximum: 1 },
            ],
        },
    },
    {
        input: `3 Level 5 monsters`,
        expected: {
            components: [
                { query: `Level 5 monsters`, minimum: 3, maximum: 3 },
            ],
        },
    },
    {
        input: `2 or more (max. 5) Level 6 FIRE monsters`,
        expected: {
            components: [
                { query: `Level 6 FIRE monsters`, minimum: 2, maximum: 5 },
            ],
        },
    },
    {
        input: `3+ (max. 6) "Hydrovenal" monsters`,
        expected: {
            components: [
                { query: `"Hydrovenal" monsters`, minimum: 3, maximum: 6 },
            ],
        },
    },
    {
        input: `0+ monsters`,
        expected: {
            components: [
                { query: `monsters`, minimum: 0, maximum: null },
            ],
        },
    },
    {
        input: `1 "Incindery Familiar" monster + 1+ (max. 3) FIRE monsters`,
        expected: {
            components: [
                { query: `"Incindery Familiar" monster`, minimum: 1, maximum: 1 },
                { query: `FIRE monsters`, minimum: 1, maximum: 3 },
            ],
        },
    },
    {
        input: `2 or more (max. 5) Level 4 Warrior monsters`,
        expected: {
            components: [
                { query: `Level 4 Warrior monsters`, minimum: 2, maximum: 5 },
            ],
        },
    },
    {
        input: `1 Level 1 monster, except a Token`,
        expected: {
            components: [
                { query: `(Level 1 monster) AND NOT (Token)`, minimum: 1, maximum: 1 },
            ],
        },
    },
    {
        input: `2 monsters, including an Xyz Monster`,
        expected: {
            components: [
                { query: `monsters`, minimum: 1, maximum: 1 },
                { query: `(monsters) AND (Xyz Monster)`, minimum: 1, maximum: 1 },
            ],
        },
    },
    {
        input: `2+ monsters with different Types`,
        expected: {
            components: [
                { query: `monsters`, minimum: 2, maximum: null, constraints: [
                    { different: [ "type" ] },
                ] },
            ],
        }
    },
    {
        input: `2 monsters with different names`,
        expected: {
            components: [
                { query: `monsters`, minimum: 2, maximum: 2, constraints: [
                    { different: [ "name" ] },
                ] },
            ],
        }
    },
    {
        input: `3 monsters with different names but the same Type`,
        expected: {
            components: [
                { query: `monsters`, minimum: 2, maximum: 2, constraints: [
                    { different: [ "name" ]
                    , same: [ "type" ] },
                ] },
            ],
        }
    },
    {
        input: `2 "Number" Xyz Monsters with the same name and Rank`,
        expected: {
            components: [
                { query: `"Number" Xyz Monster`, minimum: 2, maximum: 2, constraints: [
                    { same: [ "name", "rank" ] },
                ] },
            ],
        }
    },
    {
        input: `2+ Pendulum Monsters with the same Pendulum Scale`,
        expected: {
            components: [
                { query: `Pendulum Monsters`, minimum: 2, maximum: null, constraints: [
                    { same: [ "scale" ] },
                ] },
            ],
        }
    },
    {
        input: `3+ Link Monsters with different names and Attributes`,
        expected: {
            components: [
                { query: `Link Monsters`, minimum: 3, maximum: null, constraints: [
                    { different: [ "name", "attribute" ] },
                ] },
            ],
        }
    },
    {
        input: `2, 4 or 6 Level 3, 6 or 9 monsters`,
        expected: {
            components: [
                { query: `Level 3, 6 or 9 monsters`, any_of: [ 2, 4, 6 ] },
            ],
        }
    },
    {
        input: `1 "Abyss Actor" Pendulum Monster`,
        expected: {
            components: [
                { query: `"Abyss Actor" Pendulum Monster`, minimum: 1, maximum: 1 },
            ],
        },
    },
    {
        input: `2, 4, or 6 WATER monsters including 2 Aqua monsters`,
        expected: {
            components: [
                { query: `WATER monsters`, any_of: [ 0, 2, 4 ] },
                { query: `(WATER monsters) AND (Aqua monsters)`, minimum: 2, maximum: 2 },
            ],
        },
    },
    {
        input: `2, 4, or 6 WATER monsters including 3 Aqua monsters`,
        expected: {
            components: [
                { query: `WATER monsters`, any_of: [ 1, 3 ] },
                { query: `(WATER monsters) AND (Aqua monsters)`, minimum: 3, maximum: 3 },
            ],
        },
    },
    {
        input: `1 "Draken" Ritual Monster + 2 "Draken" monsters, including "Draken Warlock, Luard"`,
        expected: {
            components: [
                { query: `"Draken" Ritual Monster`, minimum: 1, maximum: 1 },
                { query: `"Draken" monsters`, minimum: 1, maximum: 1 },
                { query: `("Draken" monsters) AND ("Draken Warlock, Luard")`, minimum: 1, maximum: 1 },
            ],
        }
    },
    {
        input: `1 "Daeviner" monster, except "Indar, Daeviner of Lies"`,
        expected: {
            components: [
                { query: `("Daeviner" monster) AND NOT ("Indar, Daeviner of Lies")`, minimum: 1, maximum: 1 },
            ],
        }
    },
    {
        input: `1 "Naturia" monster that began the Duel in the Main Deck`,
        expected: {
            components: [
                { query: `"Naturia" monster that began the Duel in the Main Deck`, minimum: 1, maximum: 1 },
            ],
        }
    },
    {
        input: `1 "Rayna, the Draco Reincarnation"`,
        expected: {
            components: [
                { query: `"Rayna, the Draco Reincarnation"`, minimum: 1, maximum: 1 },
            ],
        }
    },
    {
        input: `"Rayna, the Draco Reincarnation"`,
        expected: {
            components: [
                { query: `"Rayna, the Draco Reincarnation"`, minimum: 1, maximum: 1 },
            ],
        }
    },
    // TODO: do we want to handle "or" more intelligently? probably.
    {
        input: `1 "Scareclaw" monster or 1 "Visas Starfrost"`,
        expected: {
            components: [
                { query: `"Scareclaw" monster or 1 "Visas Starfrost"`, minimum: 1, maximum: 1 },
            ],
        }
    },
    {
        input: `1 "Spirit of the Daemon Engine" or "Daemon Spirit" monster + 1 Machine monster`,
        expected: {
            components: [
                { query: `"Spirit of the Daemon Engine" or "Daemon Spirit" monster`, minimum: 1, maximum: 1 },
                { query: `Machine monster`, minimum: 1, maximum: 1 },
            ],
        }
    },
    // TODO: "Timelord" monster or (1 Level 1 LIGHT Fairy monster with 0 ATK)
    // but rn: ("Timelord" monster or 1 Level 1) LIGHT Fairy monster with 0 ATK
    {
        input: `1 "Timelord" monster or 1 Level 1 LIGHT Fairy monster with 0 ATK`,
        expected: {
            components: [
                { query: `"Timelord" monster or 1 Level 1 LIGHT Fairy monster with 0 ATK`, minimum: 1, maximum: 1 },
            ],
        }
    },
    {
        input: `1 LIGHT monster + 1 DARK monster`,
        expected: {
            components: [
                { query: `LIGHT monster`, minimum: 1, maximum: 1 },
                { query: `DARK monster`, minimum: 1, maximum: 1 },
            ],
        },
    },
    // test cases to implement:
    // 2 monsters with different Types (Beast, Fiend, or Illusion)
    // 2 WIND, WATER, or FIRE monsters
    // 1 "Ebon Magician Curran" equipped with “Trial of the Princesses”
    // 1 monster with 2500 or more ATK + 1 face-down Defense Position monster with 2500 or less DEF
    // 1 DARK Machine monster with a coin tossing effect + 1 FIRE monster
    // 1 "Battlin' Twista" monster + 1+ monsters whose total Levels/Ranks are lower than or equal to 6
    // 1 "Cyber Dragon" monster + 1+ monsters in the Extra Monster Zone
    // 1 Level 4 FIRE Tuner + 1+ non-Tuner "Bucket Squad" and/or "roid" monsters
    // 1 FIRE monster + 1 monster with more original ATK
    // 1 monster whose original names is “Alternaut Alternate” + 1 “Alternaut” monster
    // 2 monsters with 2600 ATK & 1000 DEF
];

module.exports = function testCanSummon(debug = false) {
    let total = TEST_CASES.length;
    const inspect = obj => util.inspect(obj, { depth: null, colors: true });
    let passed = 0;
    TEST_CASES.forEach(({ input, expected }, i) => {
        let output = parseRequirements(input);
        if(!objectEqual(output, expected)) {
            console.error(`(${i + 1}/${total}) Test case failed:`);
            console.error("Mismatch on parse:", inspect(input));
            console.error("Expected:");
            console.group();
            console.error(inspect(expected));
            console.groupEnd();
            console.error("Received:");
            console.group();
            console.error(inspect(output));
            console.groupEnd();
        }
        else {
            passed++;
        }
    });
    if(passed === total) {
        console.log(`All ${total} test case(s) passed!`);
    }
    else {
        console.log(`Test case(s) failed: ${total - passed} of ${total} (${Math.floor(passed / total * 10000) / 100}% passed)`);
    }
    return {
        passed: passed,
        total: total,
    };
};

if(require.main === module) {
    module.exports();
}
