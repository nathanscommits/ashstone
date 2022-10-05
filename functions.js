import {getMap, getPlayer, updatePlayer} from './db.js'

export const processCmd = (msg) => {
    console.log('message: ' + msg)
    const cmd = msg.split(" ")[0].toLowerCase()
    const directions = ['n', 's', 'e', 'w']
    if(directions.includes(cmd)) {
        //movement command
        moveTo(cmd)
    } else if(cmd == "attack"){
        let player = msg.split(" ")
        player.shift()
        console.log('attacking ' + player.join(" "))
    }
}

const moveTo = async (direction) => {
    //get location of player
    const player = await getPlayer({username: 'testing'})
    console.log(player, direction)
    //figure out location of destination
    const map = await getMap({name: player.location})
    console.log(map)
    if(!map[direction]) return
    //move player to destination
    updatePlayer({username: 'testing', set: {location: map[direction]}})
    //update map image for player
    global.io.emit('newMap', map[direction])
}