var express = require('express')
const { Server } = require('http')
var app = express()
var serv = require('http').Server(app)
var io = require('socket.io')(serv, {})

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
var PlayerList = {}

var Player = function(id) {
    var self = {
        x:400,
        y:300,
        id:id,
        number:Math.floor(Math.random() * 10),
        right:false,
        left:false,
        up:false,
        down:false,
        speed:10
    }
    self.updatePosition = function() {
        if (self.right) {
            self.x += self.speed
        }
        if (self.left){
            self.x -= self.speed
        }
        if (self.up){
            self.y -= self.speed
        }
        if (self.down){
            self.y += self.speed
        }
    }
    return self
}

io.sockets.on('connection', function(socket){
    console.log("Socket connected")

    socket.id = Math.random()
    //socket.x = 0;
    //socket.y = Math.floor(Math.random() * 600)
    //socket.number = Math.floor(Math.random() * 10)

    //add something to socket list
    SocketList[socket.id] = socket;

    var player = new Player(socket.id)
    PlayerList[socket.id] = player;

    //disconnection event
    socket.on('disconnect', function() {
        delete SocketList[socket.id]
        delete PlayerList[socket.id]
    })

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
    var pack = []
    for (var i in SocketList) {
        var player = PlayerList[i]
        player.updatePosition()
        //player.x++
        pack.push({
            x:player.x,
            y:player.y,
            number:player.number
        })
    }
    for (var i in SocketList) {
        var socket = SocketList[i]
        socket.emit('newPosition', pack)
    }
}, 1000/30)