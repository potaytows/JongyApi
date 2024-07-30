const mongoose = require('mongoose');


const AddOnModel = new mongoose.Schema({
    AddOnName:{
        type:String,
        required:true
    },price:{
        type:Number
    },menu_id:{
        type:mongoose.Types.ObjectId, ref: "Menu",
        required:true
        
    }
    

},{timestamps:true})


module.exports = mongoose.model('Addon',AddOnModel)

