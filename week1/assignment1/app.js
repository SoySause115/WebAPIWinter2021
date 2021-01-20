var express = require('express')
var app = express()
var path = require('path')
var port = process.env.PORT || 3000

//build a route for the index page
app.get('/', function(request, response){
    response.sendFile(path.join(__dirname + '/views/index.html'))
})

app.use(express.static(__dirname + '/views'))

app.listen(port, function(){
    console.log("Connected to Port 3000")
})