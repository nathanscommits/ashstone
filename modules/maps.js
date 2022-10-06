import { database } from "./db.js"
const characters = database.collection('characteras')
const maps = database.collection('maps')
export const moveTo = async (character, direction) => {
    //get location of player
    const player = await characters.findOne({name: character})
    //figure out location of destination
    const map = await maps.findOne({id: player.location})
    if(!map.connections[direction]) return
    //move player to destination
    characters.updateOne({name: character}, {$set: {location: map.connections[direction]}}, {upsert: true})
    //update map image for player
    global.io.emit('newMap', map.connections[direction])
}