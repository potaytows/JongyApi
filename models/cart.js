const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Types.ObjectId, ref: "Restaurant",
        required: true
    },
    selectedTables: [
        {
            _id: String,
            tableName: String
        }
    ],
    selectedMenuItem: {
        _id: String,
        menuName: String,
        price: Number,

    },
    selectedAddons: [
        {
            _id: String,
            AddOnName: String,
            price: Number
        }
    ],
    OrderTableType: {
        type: String,
        required: true
    },
    totalPrice: {
        type: Number,
        default: 0
    },username:{
        type: String

    },Count:{
        type:Number
    }

});

module.exports = mongoose.model('Cart', CartSchema);
