var express = require('express')
var mongoose =  require('mongoose')
var app = express()
var path = require('path')
var bodyparser = require('body-parser')

//sets up our middleware to use in our application
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({encoded:true}))
app.use(express.json())

mongoose.connect('mongodb://localhost:27017/gameEntries',{
    useNewUrlParser:true
}).then(function(){
    console.log("Connected to MongoDB")
}).catch(function(err){
    console.log(err)
})

//load in database templates
require('./models/Game')
var Game = mongoose.model('game');

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
app.post('/saveGame', function(request, response){
    console.log("Request has been made")
    console.log(request.body)

    new Game(request.body).save().then(function(){
        response.redirect('gamelist.html')
    })
})

//gets the data for the list
app.get('/getData', function(request, response){
    //treat this like an array; gets data
    Game.find({}).then(function(game){
        response.json({game})
    })
})

//post route to delete the entry
app.post('/deleteGame', function(request, response){
    console.log('Game has been deleted', request.body._id)
    Game.findByIdAndDelete(request.body._id).exec()
    response.redirect('gamelist.html')
})

app.use(express.static(__dirname + "/views"))
app.listen(3000, function(){
    console.log("Listening on port 3000")
})