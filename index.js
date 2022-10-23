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
    _id: req.body._id
  }
  const userCrypt = await crypt(JSON.stringify(user))
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
app.get('/', (req, res) => {
  res.render('index');
});

// Heres the websocket stuff. All the clients communicate with the server from here.
io.on('connection', (socket) => {
    console.log('a user connected', socket.id);

    // This handles client console input
    socket.on('sendCmd', processCmd);
});


server.listen(process.env.PORT, () => console.log('listening on *:', process.env.PORT) );