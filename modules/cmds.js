//Handles client commands, sort of like a router?

import { Character } from './classes.js'
import { modDoor, moveTo, searchMap } from './maps.js'
import { crypt, decrypt } from './security.js'
import { updateItems, updateMaps, updateSkills, updateSpecies, updateStats } from './sheets.js'

export const say = (details) => {
    const sender = JSON.parse(decrypt(details.token)).name
    const msg = sender + " says: " + details.msg
    //get everyone in the same location as sender

    //loop through them, creating tokens and sending the messages
    io.emit('say' + token, {msg, color: 'rgb(255,0,0)'});
}

// this object houses all the command functions
const commands = {
    'createchar': (details) => {
        const char = new Character({username: 'testing', name: 'testName', species: 'fox', stats: defaultStats, skills: defaultSkills})
        char.add()
    },
    'updateskills': updateSkills,
    'updatestats': updateStats,
    'updatespecies': updateSpecies,
    'updatemaps': updateMaps,
    'updateitems': updateItems,
    'search': searchMap,
    'door': modDoor,
    'say': say,
}

// processCmd is the main router for commands from the client.
export const processCmd = (details) => {
    console.log('message: ' + details.msg)

    //extract the command from the string
    const cmd = details.msg.split(" ")[0].toLowerCase()

    //list of possible direction commands
    const directions = ['n', 's', 'e', 'w']

    //if its a direction command, move to the map, otherwise look in the commands object
    if(directions.includes(cmd)) {
        //movement command
        moveTo(details)
    } else if(Object.keys(commands).includes(cmd)) {
        commands[cmd](details)
    }
}

