var express = require('express');
var router = express.Router();
const CartModel = require('../models/cart');

router.get('/getCartByUsername/:username/:restaurantID', async function (req, res, next) {
    try {
        const username = req.params.username;
        const restaurantID = req.params.restaurantID;

        const Cart = await CartModel.find({ username: username, restaurantId: restaurantID })
        res.send(Cart)
    } catch (error) {
        res.send(error)
    }
});
router.delete('/clearCart/:username/:restaurantID', async function (req, res, next) {
    try {
        const username = req.params.username;
        const restaurantID = req.params.restaurantID;
        const result = await CartModel.deleteMany({ username: username, restaurantId: restaurantID })
        res.send(result)
    } catch (error) {
        res.send(error)
    }
});
router.get('/getCart/:id', async function (req, res, next) {
    try {
        const id = req.params.id
        const Cart = await CartModel.findOne({ _id: id });
        res.send(Cart)
    } catch (error) {
        res.send(error)
    }
});
router.get('/getByRestaurantID/:id', async function (req, res, next) {
    try {
        const id = req.params.id
        const Cart = await CartModel.find({ restaurantId: id });
        res.send(Cart)
    } catch (error) {
        res.send(error)
    }
});

router.post('/addToCart/', async function (req, res, next) {
    try {
        let totalPrice = 0;
        if (req.body.Count >= 1) {
            totalPrice = (req.body.selectedMenuItem.price + req.body.selectedAddons.reduce((total, addon) => total + addon.price, 0)) * req.body.Count;
        }
        const existingCartItem = await CartModel.findOne({
            restaurantId: req.body.restaurantId,
            selectedMenuItem: req.body.selectedMenuItem,
            selectedAddons: req.body.selectedAddons,
            OrderTableType: req.body.OrderTableType,
            username: req.body.username,
        });
        if (existingCartItem) {
            if (existingCartItem.OrderTableType == "OrderTogether") {
                existingCartItem.Count += req.body.Count;
                existingCartItem.totalPrice += totalPrice;
                const result = await existingCartItem.save();
                res.send({ "status": "added", "obj": result });

            }else if (existingCartItem.OrderTableType == "SingleTable" && existingCartItem.selectedTables[0]._id == req.body.selectedTables[0]._id) {
                existingCartItem.totalPrice += totalPrice;
                existingCartItem.Count += req.body.Count;
                const result = await existingCartItem.save();
                res.send({ "status": "added", "obj": result });

            } else {
                const newCart = new CartModel({ ...req.body, totalPrice }); 
                const result = await newCart.save();
                res.send({ "status": "added", "obj": result });

            }


        } else {
            const newCart = new CartModel({ ...req.body, totalPrice })
            newCart.selectedMenuItem.Count = 1;
            const result = await newCart.save();
            res.send({ "status": "added", "obj": result });
        }
    } catch (error) {
        res.status(400).send(error)
        console.log(error);
    }
});

router.get('/deleteCart/:id', async function (req, res, next) {
    console.log(req.params.id)
    const id = req.params.id
    try {
        const result = await CartModel.findOneAndDelete({ _id: id })
        res.send({ "status": "deleted", "obj": result })
    } catch (error) {
        res.status(400).send(error)
        console.log(error)
    }
});


module.exports = router;
