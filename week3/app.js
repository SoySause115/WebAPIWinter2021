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

//sets up the port for the server
serv.listen(3000, function() {
    console.log("Connected to localhost 3000")
})

//server side communication
io.sockets.on('connection', function(socket){
    console.log("Socket connected")

    //recieving data
    socket.on('sendMsg', function(data) {
        console.log(data.message)
    })

    socket.on('sendBtnMsg', function(data) {
        console.log(data.message)
    })

    //sending data
    socket.emit('messageFromServer', {
        message:'Hello from the server'
    })
})

