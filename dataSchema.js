//Heres the idea for data schema

//items: At this stage, anything that isnt a map, a player or an npc is considered an item.
const item = {
    "_id": {
        "$oid": "634640e5108a58b75d0bee5e" //mongo auto assigned _id
    },
    "id": "stool01", //manual assigned id which we will use a lot for things like adding items into maps, just add an array of item ids to the maps object
    "appraisalType": "", // used for some items that can be appraised by some players who have the right skill
    "consumeBonus": {}, // modifiers to stats/skills after consuming this item, its an object where key is the skill/stat name and value is the modifier amount
    "craftBench": [ 
        "yes"
    ],
    "craftingIngredients": [ //list of ingredients needed in order to craft this item
        ""
    ],
    "craftingSkill": {//skills needed in order to craft this item. Object where key is skill name and value is the required skill level
        "craftCabinetry": 5
    }, 
    "desc": "A typical stool.", //item description
    "hiddenAmount": { //how hidden the object is on the map, the skills/levels required in order to find it
        "vision": "night vision",
        "sight": "5"
    },
    "inventorySize": 0, // how large this items inventory is. Certain items like tables or chests can hold items inside of itself
    "messages": { //optional custom messages to use when performing certain actions
        "taking": "",
        "sitting": "",
        "selling": "",
        "destroying": "",
        "trading": "",
        "throwing": "",
        "wearing": "",
        "consuming": "",
        "placing": "",
        "tasting": "",
        "smelling": ""
    },
    "name": "Stool", //The items display name
    "props": { //What a player is able to do with the item or other item properties
        "takeable": true,
        "sittable": true,
        "sellable": false,
        "destroyable": false,
        "tradable": true,
        "throwable": true,
        "wearable": false,
        "consumable": false,
        "placable": true,
        "locked": false,
        "underwater": false
    },
    "takesUpSpace": 0, //how many slots this item takes up inside of an inventory
    "throwDamage": 0, //how much damage the item inflicts if thrown at someone/something
    "value": 0, //the sell value of the item
    "wearableBonus": {//stat modifiers if this item is worn
        "craftCabinetry": 5
    },
    "keyFor": "map1", // the map id that the key is used for, if the key is for an item then "item" is the value here
    "keyDetails": { //details about the key
      "direction": "n", // the name of the door the key can unlock
      "map": "map1", // the ID of the map this key can unlock a door on
      "items": [], //an array of item ID's (strings) that this key can unlock
      "type": 'door' // if its a key for a door or an item
    }
}

//maps: Maps are locations that are stitched together. They can contain items, players and NPCs, as well as several doors of different properties
const map = {
    "_id": {
        "$oid": "633e7fde108a58b75df93afc"
    },
    "id": "map1",
    "connections": { //what other maps are connected to this map, and what direction command the player uses to move to that map
        "n": "map2", //using the n command will move to the map with id of map2
        "s": "map3",
        "w": "map4"
    },
    "desc": "Its a crowded courtyard.", 
    "items": [ //what items are present inside of the map. These items are easily visible and they can also have items inside of themselves
        "table01", //the id of the item. This item might have more items inside of it.
        "table02"
    ],
    "modifiers": { // modifiers that effect each player while on this map
        "pickpocket": -5,
        "climbing": 2
    },
    "name": "Courtyard", // display name for the map
    "npcs": [ // npc's present on the map
        "weaponsmith01" // the id of the NPC
    ],
    "locked": [ // specifies which doors are currently locked
        "s"
    ],
    "openDoors": [ // specifies which doors are currently open
        "n"
    ],
    "adminLocked": [ // specifies which doors are currently locked by admin and cannot be opened by a player
        ""
    ],
    "hiddenDoors": { //specifies which doors are hidden from the players and require skill checks and investigating to find
        "w": {
            "vision": 5,
            "sight": 3
        }
    }
}

//values: all the stats/skills/species stuff
const values = {
    "skills": {
      "appraisalGems": { //name of skill
        "id": "appraisalGems",
        "name": "Appraisal (Gems)", //display name of skill
        "value": 0, //how much of the skill a player starts out with
        "desc": "Gives the PC the ability to judge a gem's worth. The more levels they have, the more precise the valuation.",
        "rolls": [ //what other stats/skills roll along side this skill
          "intellect", //skill/stat ids
          "intuition"
        ],
        "requires": [ //what items are required to use this skill
          "loupe" //item id
        ],
        "vs": [ //which skills/stats are used to challenge this skills roll
          "intellect"
        ]
      }
    },
    "stats": { //there will probably be more properties added to stats
      "agility": { //the id of the stat is the key
        "id": "agility", //this is redundant and might get removed
        "name": "Agility", //display name of stat
        "value": 1, //starting value 
        "desc": "" //description
      },
    },
    "species": { //species modifiers
      "fox": { //id of the species is the key
        "name": "fox", //display name
        "stats": { //stat modifiers
          "intellect": 2,
          "intuition": 2,
          "hearing": 5,
          "smell": 2
        },
        "skills": { //skill modifiers
          "performing": 3,
          "appraisal": 5
        },
        "vision": "night vision" //vision type. I think theres 3 different types at the moment day/night/twilight
      }
    }
  }

