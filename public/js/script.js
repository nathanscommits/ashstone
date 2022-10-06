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

socket.on('chat message', (data) => {
data.msg = socket.id + ' says: ' + data.msg.substring(3)
var item = document.createElement('li');
item.textContent = data.msg;
item.style.color = data.color
messages.appendChild(item);
window.scrollTo(0, document.body.scrollHeight);
});