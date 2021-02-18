var express = require('express')
var mongoose =  require('mongoose')
var app = express()
var path = require('path')
var bodyparser = require('body-parser')
var serv = require('http').Server(app)
var io = require('socket.io')(serv, {})

//sets up our middleware to use in our application
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({encoded:true}))
app.use(express.json())

mongoose.connect('mongodb://localhost:27017/asteroidHS',{
    useNewUrlParser:true
}).then(function(){
    console.log("Connected to MongoDB")
}).catch(function(err){
    console.log(err)
})

//load in database templates
require('./models/Score')
var Score = mongoose.model('score');

//basic code for saving an entry
/*
//creating the schema
var Game = mongoose.model('Game', {nameofgame:String})
//adding the game to the database
var game = new Game({nameofgame:"Skyrim"})
//saving the game
game.save().then(function(){
    console.log("Game saved")
})
*/

//example of a POST route
app.post('/saveScore', function(requestName, response){
    console.log("Request has been made")
    console.log(requestName.body)

    new Score(requestName.body).save().then(function(){
        response.redirect('index.html')
    })
})

//gets the data for the list
app.get('/getData', function(request, response){
    //treat this like an array; gets data
    Score.find({}).then(function(score){
        response.json({score})
    })
})

app.use(express.static(__dirname + "/views"))
app.listen(5000, function(){
    console.log("Listening on port 5000")
})

var SocketList = {}

var GameObject = function() {
    var self = {
        //x: 400,
        //y: 300,
        //spX: 0,
        //spY: 0,
        id: ""
    }

    /*
    self.update = function() {
        self.updatePosition()
    }
    self.updatePosition = function() {
        self.x += self.spX
        self.y += self.spY
    }
    */

    return self
}

var Player = function(id) {
    var self = GameObject(id)
    self.id = id

    Player.list[id] = self

    return self
}

Player.list = {}

Player.onConnect = function(socket) {
    var player = new Player(socket.id)
}

Player.onDisconnect = function(socket) {
    delete Player.list[socket.id]
}

Player.update = function() {
    var pack = []

    for (var i in Player.list) {
        var player = player.list[i]
        pack.push({
            id: player.id
        })
    }

    return pack
}

io.sockets.on('connection', function(socket) {
    console.log("Socket connected")
    
    socket.id = Math.random()

    SocketList[socket.id] = socket
    Player.onConnect(socket)

    //send the id to the client
    socket.emit('connected', socket.id)

    //disconnection event
    socket.on('disconnect', function() {
        delete SocketList[socket.id]
        Player.onDisconnect(socket)
    })

    socket.on('sendMessageToServer', function(data) {
        var playerName = (" " + socket.id).slice(2, 7)
        for (var i in SocketList) {
            SocketList[i].emit('addToChat', playerName + ": " + data)
        }
    })
})

//gameplay loop
setInterval(function() {
    var pack = {
        player: Player.update()
    }
    for (var i in SocketList) {
        var socket = SocketList[i]
        //socket.emit('newPosition', pack)
    }
}, 1000/60)