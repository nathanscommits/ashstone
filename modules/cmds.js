//Handles client commands, sort of like a router?

import { Character } from './classes.js'
import { database } from './db.js'
import { modDoor, moveTo, searchMap, lookMap, adminGoTo } from './maps.js'
import { crypt, decrypt } from './security.js'
import { updateItems, updateMaps, updateSkills, updateSpecies, updateStats } from './sheets.js'
import { pickup, drop, adminSpawnItem } from './inventory.js'

export const disconnect = async (details) => {
    io.emit('redirect' + details.token, {url: '/logout'});
}

export const whisper = async (details) => {
    console.log("/w:", details)
    const user = JSON.parse(decrypt(details.token))
    const sender = user.name
    const reciever = details.msg.split("'")[1]

    let msg = details.msg.split("'").slice(2)[1]
    let ownmsg = 'You whispered to ' + reciever +': ' + msg

    const recieverDetails = await database.collection("characters").findOne({name: reciever, status: "online"})
    if(!recieverDetails) {
        global.io.emit('sysMessage' + details.token, {msg: 'Nobody online matches that name.', color: 'rgb(255,0,0)'})
        return
    }
    const ncrypt = await crypt(JSON.stringify({username: recieverDetails.username, name:recieverDetails.name, _id: recieverDetails._id}))
    io.emit('say' + details.token, {msg: ownmsg, color: 'rgb(180,180,255)'});
    console.log(JSON.parse(decrypt(ncrypt)))
    console.log(JSON.parse(decrypt(details.token)))
    io.emit('say' + ncrypt, {msg: sender + " whispers: " + msg, color: 'rgb(180,180,255)'});
}
export const say = async (details) => {
    const user = JSON.parse(decrypt(details.token))
    const sender = user.name
    let msg = sender + " says: " + details.msg
    let ownmsg = "You say: " + details.msg
    let col = 'rgb(255,255,100)'
    if(details.msg[0] === "/") {
        //is a function, either say or emote
        const cmd = details.msg.split(" ")[0].substr(1).toLowerCase()
        if(cmd === "say"){
            msg = sender + " says: " + details.msg.substr(details.msg.indexOf(" ") + 1)
            ownmsg = "You say: " + details.msg.substr(details.msg.indexOf(" ") + 1)
        } else if(cmd === "me") {
            msg = sender + " " + details.msg.substr(details.msg.indexOf(" ") + 1)
            ownmsg = msg
            col = 'rgb(100,255,255)'
        }
    } 
    
    //get everyone in the same location as sender
    //loop through them, creating tokens and sending the messages
    const char = await database.collection('characters').findOne({name: user.name})
    // console.log("found char: ", char)
    if(!char) return
    const nearby = await database.collection('characters').find({location: char.location, status: "online"}).toArray()
    nearby.forEach(async n => {
        if(n.name === user.name) {
            io.emit('say' + details.token, {msg: ownmsg, color: 'rgb(180,180,180)'});
            return
        } 
        // console.log("found nearby: ", n)
        const ncrypt = await crypt(JSON.stringify({username: n.username, name:n.name, _id: n._id}))
        io.emit('say' + ncrypt, {msg, color: col});
        
    })
}
const help = (details) => {
    const helptext = `
    [/whisper 'Persons Name' 'Message Here'] Sends a private message to the recepient, can be used from distance. Don't forget the ' marks!\n
    [/look] to quickly look around the map for items, doors and people\n
    [/search] to search the map for more details, items, doors and people\n
    [/me] to emote something to others on the same map\n
    [/pickup 'Item Name' 1] Pick something up from the map, the 1 is the quantity of items to pick up. Don't forget the '' quotes!\n
    [/drop 'Item Name' 1] Drop something from your inventory to the map, the 1 is the quantity of items to drop. Don't forget the 'quotes!'\n
    [/direction] to move to another map use / followed by the doors name, example: [/n] to move through the north door\n
    [/disconnect /quit /logout] Ends your session.\n
    \n
    [/goto mapId] This admin command allows you to teleport right to the given mapId\n
    [/spawn itemId] This admin command allows you to create an item out of thin air at your location\n
    `
    // [/door operation direction] operations are [open] [close], directions are the name of the door in question, example: [n] for the north door. So example command is [/door open n] to open the north door\n
    io.emit('say' + details.token, {msg: helptext, color: 'rgb(150,150,150)'});
}
// this object houses all the command functions
const commands = {
    'updateskills': updateSkills,
    'updatestats': updateStats,
    'updatespecies': updateSpecies,
    'updatemaps': updateMaps,
    'updateitems': updateItems,
    'look': lookMap,
    'search': searchMap,
    // 'door': modDoor,
    'say': say,
    'me': say,
    'whisper': whisper,
    'help': help,
    'disconnect': disconnect,
    'quit': disconnect,
    'logout': disconnect,
    'pickup': pickup,
    'drop': drop,
    'goto': adminGoTo,
    'spawn': adminSpawnItem,
}



// processCmd is the main router for commands from the client.
export const processCmd = (details) => {
    console.log('message: ' + details.msg)

    if(details.msg[0] !== "/") {
        say(details)
        return
    }
    //its a command
    //extract the command from the string
    const cmd = details.msg.split(" ")[0].substring(1).toLowerCase()

    //list of possible direction commands
    const directions = ['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se', 'up', 'down', 'left', 'right', 'lighthouse', 'ferry']

    //if its a direction command, move to the map, otherwise look in the commands object
    if(directions.includes(cmd)) {
        //movement command
        moveTo(details)
    } else if(Object.keys(commands).includes(cmd)) {
        commands[cmd](details)
    } else {
        io.emit('say' + details.token, {msg: 'That command was not found. Type /help for a list of valid commands.', color: 'rgb(255,0,0)'});
    }
}

