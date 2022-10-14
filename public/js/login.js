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