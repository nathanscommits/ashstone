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

import {getMap, getPlayer, updatePlayer} from './db.js'
import {processCmd} from './functions.js'

app.get('/', (req, res) => {
  res.render('index');
});

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);

    socket.on('login', async (usr) => {
        const player = await getPlayer({username: usr.username, password: usr.password})
        player ? console.log("login success")
        : console.log('failed login')

    })

    socket.on('chat message', (msg) => {
        msg.split(" ")[0] !== 'say' ? processCmd(msg)
        : io.emit('chat message', {msg, color: 'rgb(255,0,0)'});
    });

});



server.listen(process.env.PORT, () => console.log('listening on *:', process.env.PORT) );