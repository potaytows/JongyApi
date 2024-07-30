var express = require('express');
var router = express.Router();
var MenuModel = require('../models/menu');
const RestaurantModel = require('../models/restaurants');
const addonModel = require('../models/addons');

router.get('/getAddOnByMenuID/:id', async function (req, res, next) {
    try {
        const id = req.params.id
        const addons = await addonModel.find({ menu_id: id });
        res.send(addons)
    } catch (error) {
        res.send(error)
    }
});
router.get('/getAddon/:id', async function (req, res, next) {
    try {
        const id = req.params.id
        // const restaurant = await RestaurantModel.findOne({owner:id})
        const addon = await addonModel.findOne({ _id: id });
        res.send(addon)
    } catch (error) {
        res.send(error)
    }
});

router.post('/addAddons/:id', async function (req, res, next) {
    console.log(req.body)
    try {
        const newAddon = new addonModel(req.body);
        newAddon.menu_id = req.params.id
        const result = newAddon.save();
        res.send({"status":"added","obj":result})

    } catch (error) {
        res.status(400).send(error)
        console.log(error)
    }
});
router.get('/deleteaddon/:id', async function (req, res, next) {
    console.log(req.params.id)
    try {
        const result = await addonModel.findOneAndDelete({_id:req.params.id})
        
        res.send({"status":"deleted","obj":result})

    } catch (error) {
        res.status(400).send(error)
        console.log(error)
    }
});



module.exports = router;
