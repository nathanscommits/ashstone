var socket = io();

var register = document.getElementById('register');
var username = document.getElementById('username');
var password = document.getElementById('password');
register.addEventListener('submit', function(e) {
    e.preventDefault();
    if (username.value && password.value) {
        socket.emit('register', {username: username.value, password: password.value});
        // username.value = '';
        password.value = '';
    }
});

socket.addEventListener('onload')

socket.on("err", (m) => {
    alert(m)
})


