//All things map related. Moving, searching, doors

import { database } from "./db.js"
const characters = database.collection('characters')
const maps = database.collection('maps')

//move to a different map, if allowed
export const moveTo = async (character, direction) => {
    //get location of player
    const player = await characters.findOne({name: character})
    //figure out location of destination
    const map = await maps.findOne({id: player.location})
    if(!map.connections[direction]) return
    if(map.locked.includes(direction) || map.adminLocked.includes(direction)) {
        global.io.emit('chat message', {msg: 'say This door is locked!', color: 'rgb(255,255,255)'})
        return
    } 
    if(!map.openDoors.includes(direction)) {
        global.io.emit('chat message', {msg: 'say You opened the door and went through.', color: 'rgb(255,255,255)'})
        maps.updateOne({id: player.location}, {$push: {openDoors: direction}})
        // let oppositeDir =  direction === 'n' ? 's' : direction === 's' ? 'n' : direction === 'e' ? 'w' : 'e'
        let map2 = await maps.findOne({id: map.connections[direction]})
        for(const key in map2.connections){
            if(map2.connections[key] == player.location) {
                maps.updateOne({id: map.connections[direction]}, {$push: {openDoors: key}})
            }
        }
        
    } else {
        global.io.emit('chat message', {msg: 'say You walk through the open door.', color: 'rgb(255,255,255)'})
    }
    //move player to destination
    characters.updateOne({name: character}, {$set: {location: map.connections[direction]}}, {upsert: true})
    //update map image for player
    global.io.emit('newMap', map.connections[direction])
}

//modify a doors status (open/closed/locked)
export const modDoor = async () => {
    console.log("trying to mod door")
}