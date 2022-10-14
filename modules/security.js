//Heres where the user account server side functions will be, as well as token encryption stuff

import {database } from "./db.js";
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

export const login = async (user) => {
    // load characters
    const characterList = await characters.find({username: user.username}).toArray()
    // crypt user details
    delete user.password
    const userCrypt = await crypt(JSON.stringify(characterList[0]))
    // send crypt data to client
    return {token: userCrypt, characters: characterList}
}

