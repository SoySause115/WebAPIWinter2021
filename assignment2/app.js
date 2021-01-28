var express = require('express')
var mongoose =  require('mongoose')
var app = express()
var path = require('path')
var bodyparser = require('body-parser')

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