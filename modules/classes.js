//just a place to dump all the classes. Probably won't be too many

import { database } from "./db.js"
const characters = database.collection('characteras')
const players = database.collection('players')
const species = database.collection('species')
export class Character {
    //add species stats to default stats
    constructor({username, name, species, stats, skills}) {
        this.username = username
        this.name = name
        this.species = species
        this.stats = stats
        this.skills = skills
    }
    async add(){
        const charExists = await characters.findOne({username: this.username, name: this.name})
        if(charExists) return
        
        const speciesInfo = await species.findOne({name: this.species})
        for(const key in speciesInfo.stats) {
            this.stats[key] = this.stats[key] + speciesInfo.stats[key]
        }
        for(const key in speciesInfo.skills) {
            this.skills[key] = this.skills[key] + speciesInfo.skills[key]
        }

        characters.updateOne({username: this.username, name: this.name}, {$set: this}, {upsert: true})  

    }
}

export class Inventory {
    constructor({quant, uid}){
        this.uid = uid
        this.quant = quant
    }

    async add(){
        //check if character has enough space before adding

        //add item
        characters.updateOne({name: this.uid}, {$push: {inventory: this}}, {upsert: true})
    }

    remove(){
        //only remove quant and not all

        //remove
        characters.updateOne({name: this.uid}, {$pull: {inventory: this}}, {upsert: true})
    }
}

export class User {
    constructor({username, password, ip }) {
        this.username = username
        this.password = password
        this.ip = ip
    }

    add() {
        players.updateOne({username: this.username, password: this.password}, {$set: this}, {upsert: true})
    }
}