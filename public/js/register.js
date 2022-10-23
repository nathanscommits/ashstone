var register = document.getElementById('register');
var username = document.getElementById('username');
var password = document.getElementById('password');
register.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (username.value && password.value) {
        const newUser = {
            username: username.value,
            password: password.value
        }
        let registered = await fetch("/register", {
            method: 'POST', 
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify(newUser)
        })
        registered = await registered.json()
        console.log(registered)
        if("error" in registered) {
            alert(registered.error)
            return
        }
        // username.value = '';
        // password.value = '';
        window.location.replace("/")
    }
});


