var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var UserModel = require('../models/users')
var RestaurantModel = require('../models/restaurants');
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


router.get('/', async function (req, res, next) {
    try {
        const restaurants = await RestaurantModel.find({}, { restaurantIcon: 0 });

        res.json(restaurants)

    } catch (error) {
        res.send(error)
    }


});

router.get('/:id', async function (req, res, next) {
    try {
        const restaurants = await RestaurantModel.findById(req.params.id);
        res.json(restaurants)

    } catch (error) {
        res.send(error)
    }


});

router.get('/getByUsername/:id', async function (req, res, next) {
    try {
        const restaurants = await RestaurantModel.findOne({ owner: req.params.id },{restaurantIcon:0});
        res.json(restaurants)

    } catch (error) {
        res.send(error)
    }
});



router.post('/uploadImage/:id', upload.single('image'), async function (req, res, next) {
    console.log(req.file)
    if (req.file) {
        filename = "/../uploads/" + req.file.filename
    }
    try {
        const newRestaurant = await RestaurantModel.findOne({
            '_id': req.params.id
        })
        newRestaurant.restaurantIcon = {
            data: fs.readFileSync(path.join(__dirname + filename)),
            contentType: 'image/png'
        },
            newRestaurant.save();
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
    filename = "/../assets/default-restaurant"
    try {
        const newRestaurant = await RestaurantModel.findOne({
            '_id': req.params.id
        })
        newRestaurant.restaurantIcon = {
            data: fs.readFileSync(path.join(__dirname + filename)),
            contentType: 'image/png'
        },
            newRestaurant.save();
        res.send({ "status": "uploaded succesfully" })
    } catch (error) {
        res.status(400).send(error)
        console.log(error)
    }
});

router.post('/addRestaurant', async function (req, res, next) {
    try {
        if (req.body.description != "") {
            const newRestaurant = await RestaurantModel.create({
                restaurantName: req.body.restaurantName,
                description: req.body.description
            })

            const result = await newRestaurant.save();
            res.send({ "status": "added succesfully", obj: result })

        } else {
            const newRestaurant = await RestaurantModel.create({
                restaurantName: req.body.restaurantName,
            })

            const result = await newRestaurant.save();
            res.send({ "status": "added succesfully", obj: result })
        }

    } catch (error) {
        res.status(400).send(error)
        console.log(error)
    }
});

router.delete('/delete/:id', async function (req, res, next) {
    try {
        const restaurant = await RestaurantModel.findOne({ _id: req.params.id });
        if (restaurant.owner != "") {
            const owner = await UserModel.findOneAndUpdate({ username: restaurant.owner }, {
                $set: { role: "normal user" }
            }, { new: true });

        }
        const result = await RestaurantModel.findOneAndDelete({ _id: req.params.id });
        res.send({ "status": "deleted", "object": result })

    } catch (error) {
        res.send(error)

    }

});
router.put('/edit/:id', async function (req, res, next) {
    try {
        const restaurant = await RestaurantModel.findById(req.params.id);
        if (restaurant.owner) {
            console.log("called old owner")

            const oldOwner = await UserModel.findOneAndUpdate({ username: restaurant.owner }, {
                $set: { role: "normal user" }
            }, { new: true });
            const result = await RestaurantModel.findByIdAndUpdate({ _id: req.params.id }, {
                $set: req.body
            }, { new: true });

            const usereresult = await UserModel.findOneAndUpdate({ username: req.body.owner }, {
                $set: { role: "owner" }
            }, { new: true });
            console.log(oldOwner)
            res.send({ "status": "edited", "object": result })

        } if (!restaurant.owner) {
            console.log("called no owner")
            const result = await RestaurantModel.findByIdAndUpdate({ _id: req.params.id }, {
                $set: req.body
            }, { new: true });

            const usereresult = await UserModel.findOneAndUpdate({ username: req.body.owner }, {
                $set: { role: "owner" }
            }, { new: true });
            console.log(result)
            res.send({ "status": "edited", "object": result })

        }

    } catch (error) {
        console.log(error)
        res.send(error)
    }
});
router.get('/getlikeRestaurants/:id', async function (req, res, next) {
    try {
        const result = await RestaurantModel.find({ restaurantName: { $regex: '.*' + req.params.id + '.*' } }).limit(50)
        res.json(result)

    } catch (error) {
        res.send(error)
        console.log(error)
    }

});
module.exports = router;
