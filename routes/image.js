var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var UserModel = require('../models/users')
var RestaurantModel = require('../models/restaurants');
var MenuModel = require('../models/menu');
var multer = require('multer');
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
var upload = multer({ storage: storage });
router.get('/', async function (req, res, next) {
    try {
        const restaurants = await RestaurantModel.find();
        res.json(restaurants)

    } catch (error) {
        res.send(error)
    }


});

router.get('/getRestaurantIcon/:id', async function (req, res, next) {
    try {
        const restaurants = await RestaurantModel.findById(req.params.id, { restaurantIcon: 1, _id: 0 });
        var data = restaurants.restaurantIcon.data;
        res.end(data);

    } catch (error) {
        console.log(error)
        res.send(error)
    }
});
router.get('/getMenuIcon/:id', async function (req, res, next) {
    try {
        const restaurants = await MenuModel.findById(req.params.id, { menu_icon: 1, _id: 0 });
        var data = restaurants.menu_icon.data;
        res.end(data);

    } catch (error) {
        console.log(error)
        res.send(error)
    }
});
module.exports = router;
