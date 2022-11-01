//All of this stuff just takes the data from google sheets and puts it into mongodb with the right schema.

import { google } from "googleapis"
import {database } from "./db.js";
const itemsCollection = database.collection('items')
const mapsCollection = database.collection('maps')
const propsCollection = database.collection('properties')
const spreadsheetId = process.env.SPREADSHEET_ID

async function readSheet(range, spreadsheetId) {
    //   const { request, name } = req.body;
  try{
    const auth = new google.auth.GoogleAuth({
      projectId: "ashstone",
      credentials: {
        private_key: process.env.PRIVATE_KEY.replace(/\\n/gm, "\n"),
        client_email: process.env.CLIENT_EMAIL,
      },
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });
  
    // Create client instance for auth
    const client = await auth.getClient();
  
    // Instance of Google Sheets API
    const googleSheets = google.sheets({ version: "v4", auth: client });
  
    // Get metadata about spreadsheet
    //   const metaData = await googleSheets.spreadsheets.get({
    //     auth,
    //     spreadsheetId,
    //   });
  
    // Read rows from spreadsheet
    let getRows = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range, //"Sheet1!A:A"
    });
  
    getRows = getRows.data.values;
    getRows.shift();
    //console.log(getRows);
  
    return getRows;
  }catch(e) {
    console.log(e)
    return []
  }
};
export const updateSkills = async () => {
    const sk = await readSheet("skills!A:G", spreadsheetId)
    let skills = {}
    sk.forEach(s => {
        while(s.length < 7) s.push("")
        skills[s[0]] = {}
        skills[s[0]].id = s[0]
        skills[s[0]].name = s[1]
        skills[s[0]].value = parseInt(s[2])
        skills[s[0]].desc = s[3]
        skills[s[0]].rolls = s[4].split(",").map(m => m.trim())
        skills[s[0]].requires = s[5].split(",").map(m => m.trim())
        skills[s[0]].vs = s[6].split(",").map(m => m.trim())
    })

    // console.log(skills)
    
    propsCollection.updateOne({name: 'values'}, {$set: {skills: skills}}, {upsert: true})
}
export const updateStats = async () => {
    const st = await readSheet("stats!A:D", spreadsheetId)
    let stats = {}
    st.forEach(s => {
        while(s.length < 4) s.push("")
        stats[s[0]] = {}
        stats[s[0]].id = s[0]
        stats[s[0]].name = s[1]
        stats[s[0]].value = parseInt(s[2])
        stats[s[0]].desc = s[3]
    })

    // console.log(stats)
    
    propsCollection.updateOne({name: 'values'}, {$set: {stats: stats}}, {upsert: true})
}
export const updateSpecies = async () => {
    const st = await readSheet("species!A:D", spreadsheetId)
    let stats = {}
    st.forEach(s => {
        while(s.length < 4) s.push("")
        stats[s[0]] = {}
        stats[s[0]].name = s[0]
        stats[s[0]].stats = {}
        s[1].split(",").map(m => m.trim()).forEach(j => { 
            const b = j.split(":").map( l => l.trim())
            stats[s[0]].stats[b[0]] = parseInt(b[1])
        })
        stats[s[0]].skills = {}
        s[2].split(",").map(m => m.trim()).forEach(j => { 
            const b = j.split(":").map( l => l.trim())
            stats[s[0]].skills[b[0]] = parseInt(b[1])
        })
        stats[s[0]].vision = s[3]
    })

    // console.log(stats)
    propsCollection.updateOne({name: 'values'}, {$set: {species: stats}}, {upsert: true})
}
export const updateMaps = async () => {
    await mapsCollection.deleteMany({})
    const st = await readSheet("maps!A:N", spreadsheetId)
    const allItems = await itemsCollection.find().toArray()
    st.forEach(async (s) => {
        while(s.length < 13) s.push("")
        let maps = {}
        maps.id = s[0]
        maps.name = s[1]
        maps.connections = {}
        s[2].split(",").map(m => m.trim()).forEach(j => { 
            const b = j.split(":").map( l => l.trim())
            maps.connections[b[0]] = b[1]
        })
        const items = s[3].split(",").map(m => m.trim())
        maps.inventory = []
        items.forEach(async (i) => {
            if(i != "") {
                const found = maps.inventory.findIndex((f) => f.id == i)
                if(found >= 0) {
                    maps.inventory[found].quant += 1
                } else {
                    const iData = allItems.find(f => f.id == i)
                    console.log(i)
                    if(iData) maps.inventory.push({...iData, quant: 1})
                }
            }
        })
        maps.inventorySize = parseInt(s[12])
        if(!maps.inventorySize) maps.inventorySize = 1000
        maps.modifiers = {}
        s[4].split(",").map(m => m.trim()).forEach(j => { 
            const b = j.split(":").map( l => l.trim())
            maps.modifiers[b[0]] = parseInt(b[1])
        })
        maps.desc = s[5]
        maps.npcs = s[6].split(",").map(m => m.trim())
        maps.locked = s[7].split(",").map(m => m.trim())
        maps.openDoors = s[8].split(",").map(m => m.trim())
        maps.adminLocked = s[9].split(",").map(m => m.trim())
        maps.barredDoors = s[10].split(",").map(m => m.trim())
        maps.neighborhood = s[11]
      
        mapsCollection.updateOne({id: maps.id}, {$set: maps}, {upsert: true})
    })

    // console.log(stats)
    
}
export const updateItems = async () => {
    const st = await readSheet("items!A:AK", spreadsheetId)
    // objectID	Object Name (Display)	Description	Hidden Amount (value to beat)	Takable	Take Message	Sittable	Sit Message	Sellable	Value	Sell Message	Destroyable	Destroy Message	Tradable	Trade Message	Throwable	Throw Damage	Throw Message	Wearable	Wearable Bonus	Wear Message	Consumable	Consuming Bonus	Consume Message	Placable	Place Message	Appraisal Type	Crafting Ingredients	Crafting skill										
    st.forEach(s => {
        while(s.length < 38) s.push("")
        let items = {
            id: s[0],
            name: s[1],
            desc: s[2],
        }
        items.type = s[37]
        items.keyFor = {}
        s[36].split(";").map(m => m.trim()).forEach(j => { 
            const b = j.split(":").map( l => l.trim())
            if(b[0] === 'door') {
                b[1].split(",").map(m => m.trim()).forEach(p => { 
                    const c = p.split("=").map( q => q.trim())
                    items.keyFor[b[0]] = {}
                    items.keyFor[b[0]][c[0]] = c[1]
                    console.log(c)
                })
            } else if(b[0] === 'item') {
                items.keyFor[b[0]] = b[1].split(",").map(m => m.trim())
            }
        })
        items.props = {
            takeable : s[3] === 'yes' ? true : false,
            sittable : s[5] === 'yes' ? true : false,
            sellable : s[7] === 'yes' ? true : false,
            destroyable : s[10] === 'yes' ? true : false,
            tradable : s[12] === 'yes' ? true : false,
            throwable : s[14] === 'yes' ? true : false,
            wearable : s[17] === 'yes' ? true : false,
            consumable : s[20] === 'yes' ? true : false,
            placable : s[23] === 'yes' ? true : false,
            locked : s[34] === 'yes' ? true : false,
            underwater : s[35] === 'yes' ? true : false,
        }
        items.messages = {
            taking : s[4],
            sitting : s[6],
            selling : s[9],
            destroying: s[11],
            trading: s[13],
            throwing: s[16],
            wearing: s[19],
            consuming: s[22],
            placing: s[24],
            tasting: s[30],
            smelling: s[29],
        }

        items.appraisalType = s[25]
        items.value = s[8] === '' ?  0 : parseInt(s[8])
        items.hiddenAmount = {}
        s[28].split(",").map(m => m.trim()).forEach(j => { 
            const b = j.split(":").map( l => l.trim())
            items.hiddenAmount[b[0]] = b[1]
        })
        items.throwDamage = s[15] === '' ? 0 : parseInt(s[15])
        items.craftingIngredients = s[26].split(",").map(m => m.trim())
        items.wearableBonus = {}
        s[18].split(",").map(m => m.trim()).forEach(j => { 
            const b = j.split(":").map( l => l.trim())
            if(b[1] > 0)items.wearableBonus[b[0]] = parseInt(b[1])
        })
        items.consumeBonus = {}
        s[21].split(",").map(m => m.trim()).forEach(j => { 
            const b = j.split(":").map( l => l.trim())
            if(b[1] > 0)items.consumeBonus[b[0]] = parseInt(b[1])
        })
        items.craftingSkill = {}
        s[27].split(",").map(m => m.trim()).forEach(j => { 
            const b = j.split(":").map( l => l.trim())
            if(b[1] > 0)items.craftingSkill[b[0]] = parseInt(b[1])
        })
        items.inventorySize = s[31] === '' ?  0 : parseInt(s[31])
        items.takesUpSpace = s[32] === '' ?  0 : parseInt(s[32])
        items.craftBench = s[23].split(",").map(m => m.trim())
      
        itemsCollection.updateOne({id: items.id}, {$set: items}, {upsert: true})
    })

    // console.log(stats)
    
}