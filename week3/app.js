const { Console } = require('console')
const { Socket } = require('dgram')
var express = require('express')
var mongoose = require('mongoose')
const { Server } = require('http')
var app = express()
var serv = require('http').Server(app)
var io = require('socket.io')(serv, {})
//debugger
var debug = true

//local files
require('./db')
require('./models/Player')

var PlayerData = mongoose.model('player')

app.get('/', function(request, response) {
    response.sendFile(__dirname + '/client/index.html')
})

//sets up static server
app.use('/client', express.static(__dirname + '/client'))


//server side communication ------------------------------
//sets up the port for the server
serv.listen(3000, function() {
    console.log("Connected to localhost 3000")
})

var SocketList = {}

var GameObject = function() {
    var self = {
        x:400,
        y:300,
        spX:0,
        spY:0,
        id:""
    }

    self.update = function() {
        self.updatePosition()
    }
    self.updatePosition = function() {
        self.x += self.spX
        self.y += self.spY
    }
    self.getDist = function(point) {
        return Math.sqrt(Math.pow(self.x - point.x, 2) + Math.pow(self.y - point.y, 2))
    }

    return self
}

var Player = function(id) {
    var self = GameObject(id)
    self.id = id
    self.number = Math.floor(Math.random() * 10)
    self.right = false
    self.left = false
    self.up = false
    self.down = false
    self.attack = false
    self.mouseAngle = 0
    self.speed = 10
    
    var playerUpdate = self.update

    self.update = function() {
        self.updateSpeed()
        playerUpdate()
        //if (Math.random() < 0.1) {
        //    self.shoot(Math.random() * 360)
        //}
        if (self.attack) {
            self.shoot(self.mouseAngle)
        }
    }

    self.shoot = function(angle) {
        var b = Bullet(self.id, angle)
        b.x = self.x
        b.y = self.y
    }

    self.updateSpeed = function() {
        if (self.right) {
            self.spX = self.speed
        } else if (self.left) {
            self.spX = -self.speed
        } else {
            self.spX = 0
        }
        
        if (self.up) {
            self.spY = -self.speed
        } else if (self.down) {
            self.spY = self.speed
        } else {
            self.spY = 0
        }
    }

    Player.list[id] = self

    return self
}

Player.list = {}

//list of functions for player connection and movement
Player.onConnect = function(socket) {
    var player = new Player(socket.id)

    //recieves player input
    socket.on('keypress', function(data) {
        if (data.inputId === 'up') {
            player.up = data.state
        }
        if (data.inputId === 'down') {
            player.down = data.state
        }
        if (data.inputId === 'left') {
            player.left = data.state
        }
        if (data.inputId === 'right') {
            player.right = data.state
        }
        if (data.inputId === 'attack') {
            player.attack = data.state
        }
        if (data.inputId === 'mouseAngle') {
            player.mouseAngle = data.state
        }
    })
}

Player.onDisconnect = function(socket) {
    delete Player.list[socket.id]
}

Player.update = function() {
    var pack = []

    for (var i in Player.list) {
        var player = Player.list[i]
        player.update()
        //player.x++
        pack.push({
            x:player.x,
            y:player.y,
            number:player.number,
            id:player.id
        })
    }

    return pack
}

var Bullet = function(parent, angle) {
    var self = GameObject()
    self.id = Math.random()
    self.spX = Math.cos(angle / 180 * Math.PI) * 10
    self.spY = Math.sin(angle / 180 * Math.PI) * 10

    self.parent = parent
    self.timer = 0
    self.toRemove = false

    var bulletUpdate = self.update
    self.update = function() {
        if (self.timer++ > 100) {
            self.toRemove = true
        }
        bulletUpdate()
        for (var i in Player.list) {
            var p = Player.list[i]
            if (self.getDist(p) < 25 && self.parent !== p.id) {
                self.toRemove = true;
                //damage for hp
            }
        }
    }

    Bullet.list[self.id] = self
    return self
}

Bullet.list = {}

Bullet.update = function() {
    //creates bullets
    //if (Math.random() < 0.1) {
    //    Bullet(Math.random() * 360)
    //}
    
    var pack = []

    for (var i in Bullet.list) {
        var bullet = Bullet.list[i]
        bullet.update()
        if (bullet.toRemove) {
            delete Bullet.list[i]
        }
        else {
            pack.push({
                x:bullet.x,
                y:bullet.y,
                //number:bullet.number
            })
        }
    }

    return pack
}

//user collection
var Players = {
    "Mat":"123",
    "Rob":"asd",
    "Ron":"321",
    "Jay":"ewq"
}

var isPasswordValid = function(data, cb) {
    //return Players[data.username] === data.password
    PlayerData.findOne({username:data.username}, function(err, username) {
        cb(data.password == username.password)
    })
}

var isUsernameTaken = function(data, cb) {
    //return Players[data.username]

    PlayerData.findOne({username:data.username}, function(err, username) {
        if (username == null) {
            cb(false)
        } else {
            cb(true)
        }
    })
}

var addUser = function (data) {
    //Players[data.username] = data.password

    new PlayerData(data).save()
}

io.sockets.on('connection', function(socket){
    console.log("Socket connected")

    socket.id = Math.random()
    //socket.x = 0
    //socket.y = Math.floor(Math.random() * 600)
    //socket.number = Math.floor(Math.random() * 10)

    //add something to socket list
    SocketList[socket.id] = socket
    Player.onConnect(socket)
    //send the id to the client
    socket.emit('connected', socket.id)

    //disconnection event
    socket.on('disconnect', function() {
        delete SocketList[socket.id]
        Player.onDisconnect(socket)
    })

    //disconnection event
    socket.on('signIn', function(data) {
        /*
        if (isPasswordValid(data)) {
            Player.onConnect(socket)
            //send the id to the client
            socket.emit('connected', socket.id)
            socket.emit('signInResponse', {
                success: true
            })
        } else {
            socket.emit('signInResponse', {
                success: false
            })
        }
        */

        isPasswordValid(data, function(res) {
            if (res) {
                Player.onConnect(socket)
                //send the id to the client
                socket.emit('connected', socket.id)
                socket.emit('signInResponse', { success: true })
            } else {
                socket.emit('signInResponse', { success: false })
            }
        })
    })

    socket.on('signUp', function(data) {
        /*
        if (isUsernameTaken(data)) {
            socket.emit('signUpResponse', {
                success: false
            })
        } else {
            addUser(data)
            socket.emit('signUpResponse', {
                success: true
            })
        }
        */

        isUsernameTaken(data, function(res) {
            if (res) {
                socket.emit('signUpResponse', { success: false })
            } else {
                addUser(data)
                socket.emit('signUpResponse', { success: true })
            }
        })
    })

    //handling chat event
    socket.on('sendMessageToServer', function(data) {
        var playerName = (" " + socket.id).slice(2, 7)
        for (var i in SocketList) {
            SocketList[i].emit('addToChat', playerName + ": " + data)
        }
    })

    socket.on('evalServer', function(data) {
        if (!debug) {
            return
        }
        var response = eval(data)
        socket.emit('evalResponse', response)
    })


    //old example -----------------------------------------
    //recieving data
    //socket.on('sendMsg', function(data) {
    //    console.log(data.message)
    //})

    //socket.on('sendBtnMsg', function(data) {
    //    console.log(data.message)
    //})

    //sending data
    //socket.emit('messageFromServer', {
    //    message:'Hello from the server'
    //})
})

//setup update loop
setInterval(function() {
    var pack = {
        player: Player.update(),
        bullet: Bullet.update()
    }
    //var pack = Player.update()
    for (var i in SocketList) {
        var socket = SocketList[i]
        socket.emit('newPosition', pack)
    }
}, 1000/30)