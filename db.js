import { config } from "dotenv";
config();
import { MongoClient } from "mongodb";
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const database = client.db('ashstone');
const players = database.collection('players');
const characters = database.collection('characters');
const maps = database.collection('maps');
const species = database.collection('species');
const properties = database.collection('properties');
const items = database.collection('items');

export const getPlayer = async (search) => {
    return await players.findOne({username: search.username})
}
export const getCharacter = async (search) => {
    return await players.findOne({username: search.username, name: search.name})
}
export const getMap = async (search) => {
    return await maps.findOne({name: search.name})
}
export const updateMap = async (search) => {
    return await maps.updateOne({id: search.id}, {$set: search.set}, {upsert: true})
}
export const updateItem = async (search) => {
    return await items.updateOne({id: search.id}, {$set: search.set}, {upsert: true})
}
export const getSpecies = async (search) => {
    return await species.findOne({name: search.name})
}
export const updatePlayer = async (search) => {
    return await players.updateOne({username: search.username}, {$set: search.set}, {upsert:true})
}
export const updateCharacter = async (search) => {
    return await characters.updateOne({username: search.username, name: search.name}, {$set: search.set}, {upsert:true})
}
export const updateProperties = async (search) => {
    return await properties.updateOne({name: search.name}, {$set: search.set}, {upsert: true})
}
