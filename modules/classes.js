//just a place to dump all the classes. Probably won't be too many

import { database } from "./db.js"
const characters = database.collection('characters')
const players = database.collection('players')
const properties = database.collection('properties')
const maps = database.collection('maps')
const items = database.collection('items')
export class Character {
    //add species stats to default stats
    constructor({username, name, species, stats, location = 'map1', skills, inventory = [], wearing = {}, money = 0, inventorySize = 100}) {
        this.username = username
        this.name = name
        this.species = species
        this.stats = stats
        this.skills = skills
        this.inventory = inventory
        this.wearing = wearing
        this.money = money
        this.location = location
        this.inventorySize = inventorySize
    }
    async add(){
        const charExists = await characters.findOne({username: this.username, name: this.name})
        if(charExists) return
        
        const props = await properties.findOne({name: "values"})
        const speciesInfo = props.species[this.species]
        if(!speciesInfo) {
            console.log("cant find species: ",this.species)
            return
        }
        //these stats from species shouldnt add in permenantly, so the stats can be adjusted and balanced on the fly
        if(!Object.keys(speciesInfo.stats).length) return
        if(!Object.keys(speciesInfo.skills).length) return
        for(const key in speciesInfo.stats) {
            if(key in this.stats && "value" in this.stats[key])
                this.stats[key].value = this.stats[key].value + speciesInfo.stats[key]
        }
        for(const key in speciesInfo.skills) {
            if(key in this.skills && "value" in this.skills[key])
                this.skills[key].value = this.skills[key].value + speciesInfo.skills[key]
        }

        await characters.updateOne({username: this.username, name: this.name}, {$set: this}, {upsert: true})  

    }
}

export class Inventory {
    constructor({quant = 1, user = {}, item = {}, foreign = {}, tradePartner = {}}){
        this.user = user
        this.quant = quant
        this.item = item
        this.foreign = foreign
        this.tradePartner = tradePartner
    }

    async add(){
        //check if character has enough space before adding
        if(!("inventorySize" in this.user)) this.user.inventorySize = 100
        const newSpace = this.user.inventorySize - (this.item.takesUpSpace * this.quant)
        if(newSpace < 0) {
            return "It's too heavy.";
        }
        let found;
        this.user.inventory.map(i => {
            if(i.id === this.item.id) {
                i.quant += this.quant
                found = true;
            }
            return i;
        })
        if(!found) this.user.inventory.push({...this.item, quant: this.quant})

        //add item
        await characters.updateOne({name: this.user.name, username: this.user.username}, {$set: {inventory: this.user.inventory, inventorySize: newSpace}}, {upsert: true})
        return `You took ${this.quant}x ${this.item.name}`
    }

    async remove(){
        //only remove quant and not all
        if(!("quant" in this.item) || this.item.quant < this.quant) return "You don't have that many to get rid of..."
        if(!("inventorySize" in this.user)) this.user.inventorySize = 100
        const newSpace = this.user.inventorySize + (this.item.takesUpSpace * this.quant)

        let itemIndex = 0
        let myItem = {}
        this.user.inventory.forEach( (i, index) => {
            if(i.id === this.item.id) {
                itemIndex = index
                myItem = i
            }
        })

        if(myItem === {}) return "That item does not exist..."
        if(myItem.quant > this.quant) {
            this.user.inventory[itemIndex].quant -= this.quant
        } else {
            this.user.inventory.splice(itemIndex, 1)
        }

        await characters.updateOne({name: this.user.name, username: this.user.username}, {$set: {inventory: this.user.inventory, inventorySize: newSpace}}, {upsert: true})

        return `${this.quant}x ${this.item.name} has been removed.`
    }

    //wearables
    async equip(){
        //check that type of equipable isn't already occupied
        if(this.item.type in this.user.wearing && this.user.wearing[this.item.type] !== '') {
            return `You can't fit that on...`
        }
        this.user.wearing[this.item.type] = this.item
        await characters.updateOne({name: this.user.name, username: this.user.username}, {$set: {wearing: this.user.wearing}}, {upsert: true})
        return `You put on the ${this.item.name}`
    }

    async unequip(){
        //check that the item is actually equipped
        if(this.item.type in this.user.wearing && this.user.wearing[this.item.type].name === this.item.name ) {
            return `You aren't wearing that...`
        }
        this.user.wearing[this.item.type] = ''
        await characters.updateOne({name: this.user.name, username: this.user.username}, {$set: {wearing: this.user.wearing}}, {upsert: true})
        return `You take off the ${this.item.name}`
    }

    //banking
    deposit(){

    }

    withdraw(){

    }

    async pickup(){
        if(!this.item || !("quant" in this.item) || this.item.quant < this.quant) return "There aren't that many here..."
        //add back the items inventorySize to the foreign inv
        if(!("inventorySize" in this.foreign)) this.foreign.inventorySize = 1000;
        const newSpace = this.foreign.inventorySize + (this.item.takesUpSpace * this.quant)
        //remove item from its source inventory, or subtract quant
        let itemIndex = -1
        let items = this.foreign.inventory.map( (i, index) => {
            if(i.name === this.item.name) {
                itemIndex = index
                return i
            }
        })

        if(!items.length || !( "quant" in items[0])) return "That item does not exist..."

        if(items[0].quant > this.quant && itemIndex >= 0) {
            this.foreign.inventory[itemIndex].quant -= this.quant
        } else {
            this.foreign.inventory.splice(itemIndex, 1)
        }
        const add = await this.add()
        if(add !== `You took ${this.quant}x ${this.item.name}`) {
                //re'add to map inventory
                return add
        }
            //console.log("running update on maps", this.foreign.inventory[itemIndex])
            await maps.updateOne({id: this.foreign.id}, {$set: {inventory: this.foreign.inventory, inventorySize: newSpace}}, {upsert: true})
        return add;
    }

    async putdown(){
        const removed = await this.remove()
        
        //check item was removed ok from the user inv
        if(removed !== `${this.quant}x ${this.item.name} has been removed.`)
            return removed
        //add item to the source inventory
        
        //check new item can fit in source inv
        if(!("inventorySize" in this.foreign)) this.foreign.inventorySize = 1000;
        const newSpace = this.foreign.inventorySize - (this.item.takesUpSpace * this.quant)
        if(newSpace < 0) {
            return "It's too heavy to put down there." + this.add();
        }
        //check if item exist and increase quant if it does, add the new item if it doesnt
        let found = false;
        this.foreign.inventory.map(i => {
            if(i.name == this.item.name) {
                i.quant += this.quant
                found = true;
            }
            return i;
        })
        if(!found) this.foreign.inventory.push({...this.item, quant: this.quant})

        //add item to DB
        //console.log(this.foreign.inventory)
        await maps.updateOne({id: this.foreign.id}, {$set: {inventory: this.foreign.inventory, inventorySize: newSpace}}, {upsert: true})
        
        return `You put ${this.quant}x ${this.item.name} down`
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