const mongoose = require('mongoose');


const MenuSchema = new mongoose.Schema({
    menuName:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },restaurant_id:{
        type:mongoose.Types.ObjectId, ref: "Restaurant",
        required:true
    },status:{
        type:String,
        default:'not available'
    },menu_icon:{   
        data:Buffer,
        contentType:String
    }
    

},{timestamps:true})


module.exports = mongoose.model('Menu',MenuSchema)

