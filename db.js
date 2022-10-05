import { config } from "dotenv";
config();
import { MongoClient } from "mongodb";
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const database = client.db('ashstone');
const players = database.collection('players');
const maps = database.collection('maps');

export const getPlayer = async (search) => {
    return await players.findOne({username: search.username})
}
export const getMap = async (search) => {
    return await maps.findOne({name: search.name})
}
export const updatePlayer = async (search) => {
    return await players.updateOne({username: search.username}, {$set: search.set}, {upsert:true})
}