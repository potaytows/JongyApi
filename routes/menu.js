var express = require('express');
var router = express.Router();
var MenuModel = require('../models/menu');
const RestaurantModel = require('../models/restaurants');
var fs = require('fs');
var path = require('path');
const addonModel = require('../models/addons');

var multer = require('multer');
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, '-' + uniqueSuffix)
    }
});
var upload = multer({ storage: storage, limits: 1024 * 1024 * 5 });
router.get('/getMenus/:id', async function (req, res, next) {
    try{
    const id = req.params.id
    // const restaurant = await RestaurantModel.findOne({owner:id})
    const menu = await MenuModel.find({restaurant_id:id},{menu_icon:0});
    res.json(menu)
    }catch(error){
        res.send(error)
    }
});
router.get('/getMenu/:id', async function (req, res, next) {
    try{
    const id = req.params.id
    // const restaurant = await RestaurantModel.findOne({owner:id})
    const menu = await MenuModel.findOne({_id:id},{menu_icon:0});
    res.json(menu)
    }catch(error){
        res.send(error)
    }
});

router.get('/getMenusByUsername/:id', async function (req, res, next) {
    try{
    const id = req.params.id
    const restaurant = await RestaurantModel.findOne({owner:id})
    const menu = await MenuModel.find({restaurant_id:restaurant._id},{menu_icon:0});
    res.json(menu)
    }catch(error){
        res.send(error)
    }
});
router.post('/uploadImage/:id', upload.single('image'), async function (req, res, next) {
    console.log(req.file)
    if (req.file) {
        filename = "/../uploads/" + req.file.filename
    }
    try {
        const newMenu = await MenuModel.findOne({
            '_id': req.params.id
        })
        newMenu.menu_icon = {
            data: fs.readFileSync(path.join(__dirname + filename)),
            contentType: 'image/png'
        },
        newMenu.save();
        res.send({ "status": "uploaded succesfully" })
    } catch (error) {
        res.status(400).send(error)
        console.log(error)
    } finally {
        if (req.file) {
            fs.unlinkSync(path.join(__dirname + "/../uploads/" + req.file.filename))
        }
    }
});

router.post('/uploadImage/:id/default', async function (req, res, next) {
    filename = "/../assets/default-menu"
    try {
        const newMenu = await MenuModel.findOne({
            '_id': req.params.id
        })
        newMenu.menu_icon = {
            data: fs.readFileSync(path.join(__dirname + filename)),
            contentType: 'image/png'
        },
        newMenu.save();
        res.send({ "status": "uploaded succesfully" })
    } catch (error) {
        res.status(400).send(error)
        console.log(error)
    }
});


router.post('/addMenu/:id', async function (req, res, next) {
    const id = req.params.id
    const restaurant = await RestaurantModel.findOne({owner:id},{restaurantIcon:0,_id:1})
    
    if(restaurant){
        try {
            const newMenu = new MenuModel({menuName:req.body.menuName,price:req.body.price,restaurant_id:restaurant._id})
            newMenu.restaurant_id = restaurant._id
            const result = await newMenu.save();
            console.log(newMenu)
            res.send({ "status": "added", "object": result })
    
        } catch (error) {
            res.send(error)
        }

    }
    

});

router.put('/edit/:id', async function (req, res, next) {
    try{
    const result = await MenuModel.findByIdAndUpdate({ _id: req.params.id },{  
        $set:req.body
    },{new:true});
    res.send({ "status": "edited", "object": result })  
    console.log(result)
    }catch(error){
        res.send(error)
    }
});

router.delete('/delete/:id', async function (req, res, next) {
    try{
    const addons = await addonModel.deleteMany({menu_id:req.params.id});
    const result = await MenuModel.findOneAndDelete({ _id: req.params.id },{  
        $set:req.body
    },{new:true});
    res.send({ "status": "deleted", "object": result })  
    console.log(result)
    }catch(error){
        res.send(error)
    }
});
module.exports = router;
