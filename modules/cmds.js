//Handles client commands, sort of like a router?

import { Character } from './classes.js'
import { modDoor, moveTo } from './maps.js'
import { crypt, decrypt } from './security.js'
import { updateItems, updateMaps, updateSkills, updateSpecies, updateStats } from './sheets.js'

// this object houses all the command functions
const commands = {
    'attack': (msg) => {
        let player = msg.split(" ")
        player.shift()
        console.log('attacking ' + player.join(" "))
    },
    'createchar': () => {
        const char = new Character({username: 'testing', name: 'testName', species: 'fox', stats: defaultStats, skills: defaultSkills})
        char.add()
    },
    'updateskills': updateSkills,
    'updatestats': updateStats,
    'updatespecies': updateSpecies,
    'updatemaps': updateMaps,
    'updateitems': updateItems,
    'open': modDoor,
    'crypt': () => {
        const c = crypt("salt", msg)
        console.log(c)
        console.log(decrypt("salt", c ))
    }
}

// processCmd is the main router for commands from the client.
export const processCmd = (msg) => {
    console.log('message: ' + msg)

    //extract the command from the string
    const cmd = msg.split(" ")[0].toLowerCase()

    //list of possible direction commands
    const directions = ['n', 's', 'e', 'w']

    //if its a direction command, move to the map, otherwise look in the commands object
    if(directions.includes(cmd)) {
        //movement command
        moveTo('testName', cmd)
    } else if(Object.keys(commands).includes(cmd)) {
        commands[cmd](msg)
    }
}