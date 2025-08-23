import json
import os
import sqlite3
import requests

#big ass lookup tables make the world go around
cardTypeDict = {
    "Monster"       : 0x1,
    "Spell"         : 0x2,
    "Trap"          : 0x4,
    "N/A(Type)"     : 0x8,
    "Normal"        : 0x10,	
    "Effect"        : 0x20,
    "Fusion"        : 0x40,	
    "Ritual"        : 0x80,
    "N/A(Mon)"      : 0x100,	
    "Spirit"        : 0x200,
    "Union"         : 0x400,	
    "Gemini"        : 0x800,
    "Tuner"         : 0x1000,	
    "Synchro"       : 0x2000,	
    "Token"         : 0x4000,	
    "N/A"           : 0x8000,	
    "Quick-Play"    : 0x10000,	
    "Continuous"    : 0x20000,	
    "Equip"         : 0x40000,	
    "Field"         : 0x80000,	
    "Counter"       : 0x100000,
    "Flip"          : 0x200000,
    "Toon"          : 0x400000,
    "Xyz"           : 0x800000,
    "Pendulum"      : 0x1000000,
    "SPSummon"      : 0x2000000,
    "Link"          : 0x4000000
}

#11001100 - top 3, bottom 3, middle 3
linkArrows = {
    "tl": 0x40, 
    "tm": 0x80,
    "tr": 0x100,    
    "ml": 0x8,
    "mm": 0x10, #mid mid, always 0
    "mr": 0x20,	
    "bl": 0x1,	
    "bm": 0x2,	
    "br": 0x4	
}

scale = {
 0:     0x00000000,
 1:     0x01010000,
 2:     0x02020000,
 3:     0x03030000,
 4:     0x04040000,
 5:     0x05050000,
 6:     0x06060000,
 7:     0x07070000,
 8:     0x08080000,
 9:     0x09090000,
 10:    0x0a0a0000,
 11:    0x0b0b0000,
 12:    0x0c0c0000,
 13:    0x0d0d0000
}

attributeDict = {
    "EARTH" : 0x1,	
    "WATER" : 0x2,	
    "FIRE"  : 0x4,	
    "WIND"  : 0x8,	
    "LIGHT" : 0x10,
    "DARK"  : 0x20,
    "DIVINE": 0x40
}

typeDict = {
    "Warrior"           : 0x1,	      
    "Spellcaster"       : 0x2,	      
    "Fairy"             : 0x4,	      
    "Fiend"             : 0x8,	      
    "Zombie"            : 0x10,	  
    "Machine"           : 0x20,	  
    "Aqua"              : 0x40,  
    "Pyro"              : 0x80,	  
    "Rock"              : 0x100,	  
    "Winged Beast"      : 0x200,  
    "Plant"             : 0x400, 
    "Insect"            : 0x800,	  
    "Thunder"           : 0x1000,	  
    "Dragon"            : 0x2000,	  
    "Beast"             : 0x4000,	  
    "Beast-Warrior"     : 0x8000,	  
    "Dinosaur"          : 0x10000,	  
    "Fish"              : 0x20000,	  
    "Sea Serpent"       : 0x40000,	  
    "Reptile"           : 0x80000,	  
    "Psychic"           : 0x100000,	
    "Divine-Beast"      : 0x200000,
    "Creator God"       : 0x400000,	
    "Wyrm"              : 0x800000,
    "Cyberse"           : 0x1000000,
    "Illusion"          : 0x2000000,
    "Cyborg"            : 0x4000000,
    "Magical Knight"    : 0x8000000,
    "High Dragon"       : 0x10000000,
    "Omega Psychic"     : 0x20000000,
    "Celestial Warrior" : 0x40000000,
    "Galaxy"            : 0x80000000,
    "Yokai"             : 0x8 #Yokai will be treated as fiend, since this will only be played manually
}

def cardTypesToCode(cardType, subType, ability, pendulum, flip, effect):

    partialHex = cardTypeDict[cardType]
    if(subType != ""):
        partialHex = partialHex | cardTypeDict[subType]
    if(ability != ""):
        ability = ability.split(" / ") #wack-ass seperator
        for string in ability:
            partialHex = partialHex | cardTypeDict[string]
    if(pendulum):
        partialHex = partialHex | cardTypeDict["Pendulum"]
    if(flip):
        partialHex = partialHex | cardTypeDict["Flip"]
    if(effect):
        partialHex = partialHex | cardTypeDict["Effect"]
    return partialHex
    
def attriToCode(attri):
    return attributeDict[attri]
    
def typeToCode(monType):
    return attriToCode[monType]
    
def proccessCards(json):
    cardIterId =  210000000
    for cardId, card in json.items():
        print(card)
        if("custom" in card and card["custom"] == 1):
            jsonToSQL(card, cardIterId)
            cardIterId = cardIterId + 1
            
def jsonToSQL(card, cardId):   
    
    pendulum = ""
    flip = ""
    ability = ""
    effect = ""
    subType = ""
    
    cardType = card["card_type"]
    if(cardType != "Monster"):
    #spell/trap specific
        subType = card["type"]
        atk = 0
        defense = 0
        level = 0
        monTypeHex = 0
        attriHex = 0
    else:
    #monster specific
        subType = card["monster_color"]
        monType = card["type"]
        monType = monType.split("/")
        monTypeHex = 0
        for string in monType:
            monTypeHex = monTypeHex | typeDict[string]
        atk = card["atk"]
        defense = card["def"]
        level = card["level"] | scale[card["scale"]]
        monAttri = card["attribute"]
        monAttri = monAttri.split("/")
        attriHex = 0
        for string in monAttri:
            attriHex = attriHex | attributeDict[string]
            
        if(card["arrows"] != ""):
            arrowstring = str(card["arrows"])
            linkhex = 0
            #11001100 - top 3, bottom 3, middle 3
            if arrowstring[0] == "1":
                linkhex = linkArrows["tl"]
            if arrowstring[1] == "1":
                linkhex = linkhex | linkArrows["tm"]
            if arrowstring[2] == "1":
                linkhex = linkhex | linkArrows["tr"]
            if arrowstring[3] == "1":
                linkhex = linkhex | linkArrows["bl"]
            if arrowstring[4] == "1":
                linkhex = linkhex | linkArrows["bm"]
            if arrowstring[5] == "1":
                linkhex = linkhex | linkArrows["br"]
            if arrowstring[6] == "1":
                linkhex = linkhex | linkArrows["ml"]
            if arrowstring[7] == "1":
                linkhex = linkhex | linkArrows["mr"]
            #link arrows stored in the def value, clever
            defense = linkhex
            
        
    ability = card["ability"]
    if(card["pendulum"] == 1):
        pendulum = True
    if(card["flip"] == 1):
        flip = True
    if(card["effect"] == 1):
        effect = True
    
    #this holds special quantifiers like Level 0 or Maximum Monster. All these should be handled in custom txt   
    category = 0
    
    #used for sorting, such as cards which banish or draw cards. Should be implemented for additions but is too much work for converted cards
    genre = 0
    
    name = card["name"]
    
    if ("pendulum_effect" in card and card["pendulum_effect"] != ""):
        effect = "P\n" + card["pendulum_effect"] +"\nE\n" + card["effect"] + " [CREDIT]: " + card["username"]
    else:
        effect = card["effect"] + "[CREDIT]: " + card["username"]
    
    cardTypesHex = cardTypesToCode(cardType,subType,ability,pendulum,flip,effect)
    
    
    
    #NOT redownloading arts that exist
    art = "./arts/" + str(cardId) + ".jpg"
    if not os.path.isfile(art):
        img_data = requests.get(card["src"]).content
        with open("./arts/" + str(cardId) + ".jpg", 'wb') as handler:
            handler.write(img_data)
    
    data1 = (cardId, cardTypesHex, atk, defense, level, monTypeHex, attriHex, category, genre)
    data2 = (cardId, name, effect)
    
    con = sqlite3.connect("EXU.db")
    cur = con.cursor()
    
    cur.execute("INSERT or replace into datas values(?,4,0,NULL,?,?,?,?,?,?,?,?,null,x'00');", data1)
    cur.execute("INSERT or replace into texts values(?,?,?,'','','','','','','','','','','','','','','','');", data2)
    
    con.commit()

f = open("db.json", "r", encoding="utf-8");
content = f.read()
jsonDict = json.loads(content)
proccessCards(jsonDict)
exit

    
