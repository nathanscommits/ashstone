//All things map related. Moving, searching, doors

import { database } from "./db.js"
import { crypt, decrypt } from "./security.js"
const characters = database.collection('characters')
const maps = database.collection('maps')

//move to a different map, if allowed
export const moveTo = async (details) => {
    //get location of player
    const direction = details.msg.split(" ")[0].substring(1).toLowerCase()
    let playerDetails = JSON.parse(decrypt(details.token))
    const player = await characters.findOne({name: playerDetails.name, username: playerDetails.username})
    playerDetails.location = player.location
    // const player = await characters.findOne({name: playerDetails.username})
    //figure out location of destination
    const map = await maps.findOne({id: playerDetails.location})
    // console.log(direction, playerDetails.location, map)
    if(!map || !("connections" in map) || !map.connections[direction]) {
        global.io.emit('sysMessage' + details.token, {msg: 'Theres no way through...', color: 'rgb(255,0,0)'})
        return
    }
    if(map.locked.includes(direction) || map.adminLocked.includes(direction)) {
        global.io.emit('sysMessage' + details.token, {msg: 'This door is locked!', color: 'rgb(255,255,255)'})
        return
    } 
    if(!map.openDoors.includes(direction)) {
        global.io.emit('sysMessage' + details.token, {msg: 'You opened the door and went through.', color: 'rgb(255,255,255)'})
        maps.updateOne({id: playerDetails.location}, {$push: {openDoors: direction}})
        // let oppositeDir =  direction === 'n' ? 's' : direction === 's' ? 'n' : direction === 'e' ? 'w' : 'e'
        let map2 = await maps.findOne({id: map.connections[direction]})
        if(!map2 || !("connections" in map2)) {
            global.io.emit('sysMessage' + details.token, {msg: 'Something is preventing you from entering...', color: 'rgb(255,0,0)'})
            return
        }
        for(const key in map2.connections){
            if(map2.connections[key] == playerDetails.location) {
                maps.updateOne({id: map.connections[direction]}, {$push: {openDoors: key}}, {upsert: true})
            }
        }
        
    } else {
        global.io.emit('sysMessage' + details.token, {msg: 'You walk through the open door.', color: 'rgb(255,255,255)'})
    }
    //move player to destination
    await characters.updateOne({name: playerDetails.name, username: playerDetails.username}, {$set: {location: map.connections[direction]}}, {upsert: true})
    //update map image for player
    
    global.io.emit('newMap' + details.token, {map: map.connections[direction]})
    lookMap(details)
    alertNearby(details)
}

export const adminGoTo  = async (details) => {
    const userDetails = JSON.parse(decrypt(details.token))
    const cmdArr = details.msg.split(" ")
    if(cmdArr.length < 2) return
    const mapId = cmdArr[1].trim()
    const newMap = await database.collection('maps').findOne({id: mapId})
    if(!newMap) return
    await characters.updateOne({name: userDetails.name, username: userDetails.username}, {$set: {location: mapId}}, {upsert: true})
    global.io.emit('newMap' + details.token, {map: mapId})
    lookMap(details)
    alertNearby(details)
}

export const alertNearby = async (details) => {
    let playerDetails = JSON.parse(decrypt(details.token))
    const player = await database.collection("characters").findOne({name: playerDetails.name, username: playerDetails.username})
    const nearby = await database.collection("characters").find({location: player.location, status: "online"}).toArray()

    nearby.forEach(async n => {
        if(n.name === player.name) return
        console.log("name: ", n.name)
        const ncrypt = await crypt(JSON.stringify({username: n.username, name:n.name, _id: n._id}))
        io.emit('say' + ncrypt, {msg: `${player.name} has entered the room`, color: 'rgb(255,50,50)'});
    })
}

export const lookMap = async (details) => {
    //get location of player
    let playerDetails = JSON.parse(decrypt(details.token))
    const player = await characters.findOne({name: playerDetails.name, username: playerDetails.username})
    playerDetails.location = player.location
    let [players, map] = await Promise.all([
        characters.find({location: player.location, status: "online"}).toArray(),
        maps.findOne({id: playerDetails.location})
    ])
    players = players.flatMap(p => p.name != playerDetails.name ? p.name : [])
    //get map details
    console.log(players)
    if(map && "desc" in map) {
        let message = map.desc.split(".")[0] + '...'
        if(players.length) {
            message += ' People: [' + players.join() + '].'
        }
        if(map.inventory.length){
            const items = map.inventory.map( m => m.name)
            message += ' Items: [' + items.join() + '].'
        }
        message += ' Exits: [' + Object.keys(map.connections) + ']'
        global.io.emit('sysMessage' + details.token, {msg: message, color:'rgb(255,255,255)'})
    } else global.io.emit('sysMessage' + details.token, {msg: 'Error reading sheet info', color:'rgb(255,0,0)'})
}
export const searchMap = async (details) => {
    //get location of player
    let playerDetails = JSON.parse(decrypt(details.token))
    const player = await characters.findOne({name: playerDetails.name, username: playerDetails.username})
    playerDetails.location = player.location
    let [players, map] = await Promise.all([
        characters.find({location: player.location, status: "online"}).toArray(),
        maps.findOne({id: playerDetails.location})
    ])
    players = players.flatMap(p => p.name != playerDetails.name ? p.name : [])
    //get map details
    console.log(players)
    if(map && "desc" in map) {
        let message = map.desc
        if(players.length) {
            message += ' People: [' + players.join() + '].'
        }
        if(map.inventory.length){
            const items = map.inventory.map( m => m.name)
            message += ' Items: [' + items.join() + '].'
        }
        message += ' Exits: [' + Object.keys(map.connections) + ']'
        global.io.emit('sysMessage' + details.token, {msg: message, color:'rgb(255,255,255)'})
    } else global.io.emit('sysMessage' + details.token, {msg: 'Error reading sheet info', color:'rgb(255,0,0)'})
}

//modify a doors status (open/closed/locked)
export const modDoor = async (details) => {
    const cmd = details.msg.substr(1)
    let playerDetails = JSON.parse(decrypt(details.token))
    const player = await characters.findOne({name: playerDetails.name, username: playerDetails.username})
    playerDetails.location = player.location
    const operation = cmd.split(" ")[1]
    const door = cmd.split(" ")[2]
    if(!operation || !door) return;

    
    let map = await maps.findOne({id: playerDetails.location})
    
    // console.log(map)
    if(operation === 'open' && !map.openDoors.includes(door)){
        global.io.emit('sysMessage' + details.token, {msg: "You opened the door", color:'rgb(255,255,255)'})
        map.openDoors.push(door)
        maps.updateOne({id: playerDetails.location}, {$set: {openDoors: map.openDoors}}, {upsert: true})
        console.log("opening door")

        const map2 = await maps.findOne({id: map.connections[door]})
        for(const key in map2.connections){
            if(map2.connections[key] == playerDetails.location) {
                maps.updateOne({id: map.connections[door]}, {$push: {openDoors: key}}, {upsert: true})
            }
        }

    } else if(operation === 'close' && map.openDoors.includes(door)){
        global.io.emit('sysMessage' + details.token, {msg: "You closed the door", color:'rgb(255,255,255)'})
        const index = map.openDoors.indexOf(door)
        map.openDoors.splice(index , 1) 
        maps.updateOne({id: playerDetails.location}, {$set: {openDoors: map.openDoors}}, {upsert: true})
        console.log("closing door")

        let map2 = await maps.findOne({id: map.connections[door]})
        for(const key in map2.connections){
            if(map2.connections[key] == playerDetails.location) {
                map2.openDoors.splice(map2.openDoors.indexOf(key), 1)
                maps.updateOne({id: map.connections[door]}, {$set: {openDoors: map2.openDoors}}, {upsert: true})
            }
        }
    } else if(operation === 'check'){
        const status = map.openDoors.includes(door) ? "open" : "closed"
        global.io.emit('sysMessage' + details.token, {msg: "The door to the " + door + " is " + status, color:'rgb(255,255,255)'})
    // } else if(operation === 'lock'){ //and player has the right key
    //     const player = await characters.findOne({name: playerDetails.username})
    //     const hasKey = player.inventory
    // } else if(operation === 'unlock'){
    // } else if(operation === 'bar'){
    // } else if(operation === 'unbar'){
    }   
        

    
}