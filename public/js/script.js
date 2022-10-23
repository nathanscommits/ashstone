//This file contains most of the client side javascript. Would probably be better to split this up into multiple files though


var socket = io();

var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');
let token = localStorage.getItem("token")

form.addEventListener('submit', function(e) {
e.preventDefault();
if (input.value) {
    socket.emit('sendCmd', {msg: input.value, token});
    input.value = '';
}
});

const printToConsole = (text, color) => {
    var item = document.createElement('li');
    item.textContent = text
    item.style.color = color
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
}

// socket.on("logInSuccess", (m) => {
//     localStorage.setItem("token", m.token)
//     token = localStorage.getItem("token")
//     console.log(m)
//     login.style.display = 'none'
//     // display character selection
//     // print available characters to console
//     m.characters.forEach(c => {
//         printToConsole("System", c, 'rgb(255, 255, 255)')
//     })
//     printToConsole("System", 'New Character? type "new [name]"', 'rgb(255, 255, 255)')
//     // socket.emit("loggedIn", token)
//     socket.on('newMap' + token, (map) => {
//         document.getElementById('map').src = 'img/' + map + '.jpg'
//     })
//     socket.on('sysMessage' + token, (details) => {
//         printToConsole('System', details.msg, details.color)
//     })
//     socket.on('say'+token, (data) => {
//         printToConsole(socket.id + ' says', data.msg.substring(3), data.color)
//     });
//     socket.on("setStats"+token, (m) => {
//         const stats = document.getElementById('stats')
//         stats.innerHTML = m
//     })
// })



// window.onload = () => {
//     const token = localStorage.getItem("token")
//     if(token) {
//         login.style.display = 'none'
//         socket.emit("loggedIn", token)
//     }
// }


