//Heres where the user account server side functions will be, as well as token encryption stuff

import {database } from "./db.js";
import { Character } from './classes.js'
const characters = database.collection('characters')

export const crypt = (text) => {
    const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
    const byteHex = (n) => ("0" + Number(n).toString(16)).substr(-2);
    const applySaltToChar = (code) => textToChars(process.env.SECRET).reduce((a, b) => a ^ b, code);
  
    return text
      .split("")
      .map(textToChars)
      .map(applySaltToChar)
      .map(byteHex)
      .join("");
};
  
export const decrypt = (encoded) => {
    const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
    const applySaltToChar = (code) => textToChars(process.env.SECRET).reduce((a, b) => a ^ b, code);
    return encoded
        .match(/.{1,2}/g)
        .map((hex) => parseInt(hex, 16))
        .map(applySaltToChar)
        .map((charCode) => String.fromCharCode(charCode))
        .join("");
};

export const login = async (req, res) => {
    // load characters
    const user = req.body
    const characterList = await characters.find({username: user.username, password: user.password}).toArray()
    // crypt user details
    if(!characterList) {
        res.send('login failed')
        return
    }
    delete user.password
    const newToken = {
        username: user.username
    }
    const userCrypt = await crypt(JSON.stringify(newToken)) //problem here, shouldnt be only the first character found
    // send crypt data to client
    res.send({token: userCrypt, characters: characterList})
}

export const register = async (req, res) => {
    const foundUsers = await database.collection("players").find({username: req.body.username}).toArray()
    console.log(foundUsers)
    if(foundUsers.length) {
        res.error = "This username is already taken."
        res.send({error: res.error, created: false})
        return
    }
    
    let newAccount = await database.collection("players").insertOne(req.body)
    res.send({created: true, account: newAccount})
}

export const createCharacter = async (req, res) => {
    const stats = await database.collection("properties").findOne({name: "values"})
    let username = await JSON.parse(decrypt(req.body.token))
    username = username.username
    console.log(req.body, username)
    const newChar = {
        username, 
        name: req.body.name, 
        species: req.body.species, 
        stats: stats.stats, 
        skills: stats.skills
    }
    const char = new Character(newChar)
    console.log("new Character: ", char.username)
    await char.add()
    const characters = await database.collection("characters").find({username}).toArray()
    res.send({characters})
}

