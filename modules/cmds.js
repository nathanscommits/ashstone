import { Character } from './classes.js'
import { moveTo } from './maps.js'
import { updateItems, updateMaps, updateSkills, updateSpecies, updateStats } from './sheets.js'


export const processCmd = (msg) => {
    console.log('message: ' + msg)
    const cmd = msg.split(" ")[0].toLowerCase()
    const directions = ['n', 's', 'e', 'w']
    if(directions.includes(cmd)) {
        //movement command
        moveTo('testing', cmd)
    } else if(cmd == "attack"){
        let player = msg.split(" ")
        player.shift()
        console.log('attacking ' + player.join(" "))
    } else if(cmd == 'createchar') {
        const char = new Character({username: 'testing', name: 'testName', species: 'fox', stats: defaultStats, skills: defaultSkills})
        char.add()
    } else if(cmd == 'updateskills') {
        updateSkills()
    } else if(cmd == 'updatestats') {
        updateStats()
    } else if(cmd == 'updatespecies') {
        updateSpecies()
    } else if(cmd == 'updatemaps') {
        updateMaps()
    } else if(cmd == 'updateitems') {
        updateItems()
    }
}



