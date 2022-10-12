//This file contains most of the client side javascript. Would probably be better to split this up into multiple files though

var socket = io();

var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');

var login = document.getElementById('login');
var username = document.getElementById('username');
var password = document.getElementById('password');

login.addEventListener('submit', function(e) {
e.preventDefault();
if (username.value && password.value) {
    socket.emit('login', {username: username.value, password: password.value});
    // username.value = '';
    password.value = '';
}
});

form.addEventListener('submit', function(e) {
e.preventDefault();
if (input.value) {
    socket.emit('chat message', input.value);
    input.value = '';
}
});

socket.on('newMap', (map) => {
    document.getElementById('map').src = 'img/' + map + '.jpg'
})

const printToConsole = (title, text, color) => {
    var item = document.createElement('li');
    item.textContent = title + ": " + text
    item.style.color = color
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
}

socket.on('chat message', (data) => {
    printToConsole(socket.id + ' says', data.msg.substring(3), data.color)
});

socket.on("logInSuccess", (m) => {
    // localStorage.setItem("token", m.token)
    // const token = localStorage.getItem("token")
    console.log(m)
    login.style.display = 'none'
    // display character selection
    // print available characters to console
    m.characters.forEach(c => {
        printToConsole("System", c, 'rgb(255, 255, 255)')
    })
    printToConsole("System", 'New Character? type "new [name]"', 'rgb(255, 255, 255)')
    // socket.emit("loggedIn", token)
})

socket.on("setStats", (m) => {
    const stats = document.getElementById('stats')
    stats.innerHTML = m
})

window.onload = () => {
    const token = localStorage.getItem("token")
    if(token) {
        login.style.display = 'none'
        socket.emit("loggedIn", token)
    }
}
