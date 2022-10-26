import express from 'express';
import { config } from "dotenv";
config();
const app = express();
import { createServer } from 'http';
const server = createServer(app);
import { Server } from 'socket.io';
const io = new Server(server);
global.io = io //make io available from any module file
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("views", "views");
app.set("view engine", "ejs");
app.use(express.static("public"));

import {database} from './modules/db.js'
import {processCmd} from './modules/cmds.js'
import { createCharacter, crypt, decrypt, login, register } from './modules/security.js';
import { alertNearby } from './modules/maps.js';

app.get('/logout', (req, res) => {
  res.render('logout');
});
app.get('/register', (req, res) => {
  res.render('register');
});
app.post('/register', register)
app.post('/createcharacter', createCharacter)
app.post('/login', login)
app.post('/newtoken', async (req, res) => {
  const user = {
    username: req.body.username,
    name: req.body.name,
    _id: req.body._id,
    socketId: req.body.socketId
  }

  database.collection('characters').updateOne({username: user.username, name: user.name}, {$set: {status: 'online',}, $push:{socketIds: user.socketId}}, {upsert: true})

  const userCrypt = await crypt(JSON.stringify(user))
  alertNearby({token: userCrypt})
  res.send({token: userCrypt})
})
app.post('/save-note', async (req, res) => {
  var data = req.body;
  console.log(data) //expected {text: "textarea input"}
  res.sendStatus(200)
})
app.get('/character/:id/:token', async (req, res) => {
  const character = await database.collection('characters').findOne({name: req.params.id})
  console.log(character)
  res.render('index', {...req.params, character});
})
app.get('/', async (req, res) => {
  const props = await database.collection("properties").findOne({name: "values"})
  const species = props.species
  res.render('index', {species});
});

// Heres the websocket stuff. All the clients communicate with the server from here.
io.on('connection', (socket) => {
    console.log('a user connected', socket.id);

    // This handles client console input
    socket.on('sendCmd', processCmd);
    socket.on('disconnect', async () => {
      console.log("Disconnecting: ", socket.id)
      let user = await database.collection("characters").findOne({socketIds: {$in: [socket.id]}})
      if(!user || !("socketIds" in user)) return
      user.socketIds = user.socketIds.flatMap( m => socket.id != m ? m : [])
      database.collection("characters").updateOne({name: user.name, username: user.username}, {$set: {status: "offline", socketIds: user.socketIds}}, {upsert: true})
    })
});


server.listen(process.env.PORT, () => console.log('listening on *:', process.env.PORT) );