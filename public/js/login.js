var login = document.getElementById('login');
var newCharForm = document.getElementById('newCharForm');

newCharForm.addEventListener('submit', async (e) => {
    var name = document.getElementById('newCharName');
    var species = document.getElementById('newCharSpecies');
    e.preventDefault();
    if(!name.value || !species.value) {
        return
    }
    let data = await fetch("/createcharacter", {
        method: 'POST', 
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }, 
        body: JSON.stringify({
            name: name.value, 
            species: species.value, 
            token
        })
    })
    data = await data.json()
    loadCharOptions(data)
    document.getElementById("newCharacterForm").style.display = "none"
    document.getElementById("selectCharForm").style.display = "block"

})

const openSocketsOnLogin = (token) => {
    socket.on('newMap' + token, (details) => {
        console.log("new map triggered")
        // token = details.token
        // localStorage.setItem("token", token)
        document.getElementById('map').style.backgroundImage = `url('img/${details.map}.jpg')`
        document.getElementById('map').innerHTML = `${details.map}`
    })
    socket.on('sysMessage' + token, (details) => {
        printToConsole(details.msg, details.color)
    })
    socket.on('say'+token, (data) => {
        printToConsole(data.msg, data.color)
    });
    socket.on("setStats"+token, (m) => {
        const stats = document.getElementById('stats')
        stats.innerHTML = m
    })
    const char = JSON.parse(localStorage.getItem('character'))
    const stats = char.stats
    const skills = char.skills
    let html = `
    Name: ${char.name}\n
    Money: ${char.money}\n
    Species: ${char.species}\n
    Location: ${char.location}\n\n
    Skills:\n
    `
    for(const key in skills) {
        html += `${key}: ${JSON.stringify(skills[key])}\n`
    }
    html += `\nStats:\n`
    for(const key in stats) {
        html += `${key}: ${JSON.stringify(stats[key])}\n`
    }
    console.log(stats, skills, html)
    document.getElementById('stats').innerHTML = html
    document.getElementById('map').style.backgroundImage = `url('img/${char.location}.jpg')`
    document.getElementById('map').innerHTML = `${char.location}`
}

const loadChar = async (char) => {
    const characters = JSON.parse(localStorage.getItem("characters"))
    char = characters.find(c => c.name === char.name)
    localStorage.setItem("character", JSON.stringify(char))
    document.getElementById("selectCharForm").style.display = "none"
    document.getElementById("console").style.display = "block"
    document.getElementById("right-panel").style.display = "block"
    document.getElementById("map").style.display = "block"
    token = await fetch("/newtoken", {
        method: 'POST', 
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }, 
        body: JSON.stringify(char)
    })
    token = await token.json()
    token = token.token
    console.log(token)
    localStorage.setItem("token", token)
    openSocketsOnLogin(token)
}

login.addEventListener('submit', async (e) => {
var username = document.getElementById('username');
var password = document.getElementById('password');
e.preventDefault();
if (username.value && password.value) {
    // socket.emit('login', {username: username.value, password: password.value});
    // username.value = '';
    const user = {
        username: username.value,
        password: password.value
    }
    password.value = '';
    let data = await fetch('/login', {
        method: 'POST', 
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }, 
        body: JSON.stringify(user)
    })
    data = await data.json()

    if(!"token" in data) return
    localStorage.setItem("token", data.token)
    token = data.token
    loadCharOptions(data)
    document.getElementById("login-form").style.display = "none"
    document.getElementById("selectCharForm").style.display = "block"
}
});

const loadCharOptions = (data) => {
    if("characters" in data) {
        localStorage.setItem("characters", JSON.stringify(data.characters))
        console.log(data)
        let currentChars = `<h1>Select your character:</h1>`
        data.characters.forEach(c => {
            console.log(c)
            const charObj = {
                name: c.name,
                username: c.username,
                _id: c._id
            }
            currentChars += `<button onclick='loadChar(${JSON.stringify(charObj)})'>${c.name}</button><br>`
        })
        currentChars += `<br><button onclick='createChar()'>Create New Character</button><br>`
        document.getElementById("currentCharacterList").innerHTML = currentChars
    }
}

const createChar = () => {
    document.getElementById("selectCharForm").style.display = "none"
    document.getElementById("newCharacterForm").style.display = "block"
}
const selectChar = () => {
    document.getElementById("newCharacterForm").style.display = "none"
    document.getElementById("selectCharForm").style.display = "block"
}