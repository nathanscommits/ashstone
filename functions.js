import {getCharacter, getMap, getPlayer, getSpecies, updateCharacter, updatePlayer} from './db.js'
import { updateItems, updateMaps, updateSkills, updateSpecies, updateStats } from './sheets.js'

const defaultStats = {
    agility: 1,
    intellect: 1,
    intuition: 1,
    speed: 1,
    strength: 1,
    hp: 1,
    luck: 1,
    sight: 1,
    hearing: 1,
    smell: 1,
}

const defaultSkills = {
    appraisalWeapons: 0,
    appraisalArmour: 0,
    appraisalGems: 0,
    appraisal: 0,
    performing: 0,
}

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

class Character {
    //add species stats to default stats
    constructor({username, name, species, stats, skills}) {
        this.username = username
        this.name = name
        this.species = species
        this.stats = stats
        this.skills = skills
    }
    async add() {
        const charExists = await getCharacter({username: this.username, name: this.name})
        if(charExists) return
        
        const speciesInfo = await getSpecies({name: this.species})
        for(const key in speciesInfo.stats) {
            this.stats[key] = this.stats[key] + speciesInfo.stats[key]
        }
        for(const key in speciesInfo.skills) {
            this.skills[key] = this.skills[key] + speciesInfo.skills[key]
        }

        updateCharacter({username: this.username, name: this.name, set: this})  

    }
}