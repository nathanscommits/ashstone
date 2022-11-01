// All inventory operations can be in here
import { Inventory } from "./classes.js"
import { database } from "./db.js"
import { decrypt } from "./security.js"
const characters = database.collection('characters')
const players = database.collection('players')
const properties = database.collection('properties')
const maps = database.collection('maps')
const items = database.collection('items')

export const pickup = async (details) => {
    const decrypted = JSON.parse(decrypt(details.token))
    const cmdLine = details.msg.split("'")
    const user = await characters.findOne({name: decrypted.name})
    const cmd = {
        item: cmdLine[1].trim().toLowerCase(),
        foreign: user.location,
        quant: 1,
    }
    if(cmdLine.length > 2) cmd.quant = parseInt(cmdLine[2].trim())
    if(cmd.quant < 1) cmd.quant = 1

    const foreign = await maps.findOne({id: cmd.foreign})
    let item = foreign.inventory.flatMap(f => f.name.trim().toLowerCase() == cmd.item ? f : []) //await items.findOne({name: cmd.item})
    if(item.length > 0) item = item[0]
    else {
        io.emit('sysMessage' + details.token, {msg: "You couldn't find that item. (Is it spelled right? It is case sensitive)", color: 'rgb(180,180,180)'});
        return 
    }
    const quant = cmd.quant;

    const obj = new Inventory({
        quant, user, item, foreign
    })
    // console.log(item)
    const result = await obj.pickup()
    io.emit('sysMessage' + details.token, {msg: result, color: 'rgb(180,180,180)'});
    const updatedChar = await characters.findOne({name: decrypted.name})
    io.emit('setStats' + details.token, updatedChar);
}
export const drop = async (details) => {
    const decrypted = JSON.parse(decrypt(details.token))
    const cmdLine = details.msg.split("'")
    const user = await characters.findOne({name: decrypted.name})
    const cmd = {
        item: cmdLine[1].trim().toLowerCase(),
        foreign: user.location,
        quant: 1,
    }
    if(cmdLine.length > 2) cmd.quant = parseInt(cmdLine[2].trim())
    if(cmd.quant < 1) cmd.quant = 1

    const foreign = await maps.findOne({id: cmd.foreign})
    
    let item = user.inventory.flatMap(f => f.name.trim().toLowerCase() == cmd.item ? f : []) //await items.findOne({name: cmd.item})
    if(item.length > 0) item = item[0]
    else {
        io.emit('sysMessage' + details.token, {msg: "You couldn't find that item. (Is it spelled right?)", color: 'rgb(180,180,180)'});
        return 
    }
    // console.log(item)
    const quant = cmd.quant;

    const obj = new  Inventory({
        quant, user, item, foreign
    })
    // console.log(item)
    const result = await obj.putdown()
    io.emit('sysMessage' + details.token, {msg: result, color: 'rgb(180,180,180)'});
    const updatedChar = await characters.findOne({name: decrypted.name})
    io.emit('setStats' + details.token, updatedChar);
}