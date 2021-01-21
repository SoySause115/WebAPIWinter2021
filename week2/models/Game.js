var mongoose = require('mongoose')
var Schema = mongoose.Schema

var GameSchema = new Schema({
    game:{
        type:String,
        require:true
    }
})

mongoose.model('game', GameSchema)