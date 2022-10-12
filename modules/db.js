//this is just used to connect to mongodb. using a uri string from the env variables file
import { config } from "dotenv";
config();
import { MongoClient } from "mongodb";
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
export const database = client.db('ashstone');
