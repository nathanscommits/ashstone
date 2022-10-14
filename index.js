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
import { decrypt, login } from './modules/security.js';

app.get('/logout', (req, res) => {
  res.render('logout');
});
app.get('/register', (req, res) => {
  res.render('register');
});
app.get('/', (req, res) => {
  res.render('index');
});

// Heres the websocket stuff. All the clients communicate with the server from here.
io.on('connection', (socket) => {
    console.log('a user connected', socket.id);

    //tries to register the client with a new account
    socket.on('register', async (usr) => {
        const player = await database.collection('players').findOne({username: usr.username})
        player ? io.to(socket.id).emit("err", "User already exists with that name.")
        : console.log('register: ', usr)
    })

    //tries to log the client in
    socket.on('login', async (usr) => {
        const player = await database.collection('players').findOne({username: usr.username, password: usr.password})
        if(player) {
            console.log("login success")
            const cryptData = await login(player)
            console.log(cryptData)
            io.to(socket.id).emit("logInSuccess", cryptData)
        }  
        else console.log('failed login')

    })
    // sends a secure token to the client if they are successful in logging in. This token is used to identify the client for the remainder of their session, in a semi secure way
    socket.on('loggedIn', async (token) => {
        const de = await decrypt(token)
        console.log("decrypted: ", de)
    })

    // This handles client console input
    socket.on('sendCmd', processCmd);

});


server.listen(process.env.PORT, () => console.log('listening on *:', process.env.PORT) );