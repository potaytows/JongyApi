var express = require('express');
var router = express.Router();
const CartModel = require('../models/cart');
const ReservationModel = require('../models/reservation');


router.post('/reserveTables', async function (req, res, next) {
    try {
        let Total = 0;
        let newReservation = new ReservationModel(req.body);
        let menus = await CartModel.find({ username: req.body.username, restaurantId: req.body.restaurant_id });
        newReservation.orderedFood = menus;
        menus.map((item, index) => {
            Total += item.totalPrice;
        });
        newReservation.total = Total;
        newReservation.status = "รอการยืนยัน"; 
        await newReservation.save();
        const ress = await CartModel.deleteMany({ username: req.body.username, restaurantId: req.body.restaurant_id });
        res.send({ status: "reserved successfully", obj: newReservation });
    } catch (error) {
        res.send(error);
    }
});


router.get('/getReservationByRestaurantID/:id', async function (req, res, next) {
    try {
        const result = await ReservationModel.find({ restaurant_id: req.params.id }).populate("reservedTables").populate("orderedFood.selectedTables","-x -y").populate("orderedFood.selectedMenuItem","-menu_icon").populate("orderedFood.selectedAddons").populate("restaurant_id","-restaurantIcon").sort({ createdAt: 1 })
        res.json(result)
    } catch (error) {
        res.send(error)
    }

});
router.get('/getReservationsByUsername/:username', async function (req, res, next) {
    try {
        const { username } = req.params;
        const result = await ReservationModel.find({ username: username })
            .populate("reservedTables")
            .populate("orderedFood.selectedTables", "-x -y")
            .populate("orderedFood.selectedMenuItem", "-menu_icon")
            .populate("orderedFood.selectedAddons")
            .populate("restaurant_id", "-restaurantIcon")
            .sort({ createdAt: 1 });
        
        res.json(result);
    } catch (error) {
        res.status(500).send(error);
    }
});



router.delete('/cancelReservation/:id', async function (req, res, next) {
    try {
        const result = await ReservationModel.findByIdAndDelete(req.params.id);
        if (result) {
            res.send({ status: "deleted successfully" });
        } else {
            res.status(404).send({ status: "reservation not found" });
        }
    } catch (error) {
        res.send(error);
    }
});
router.put('/confirmReservation/:id', async function (req, res, next) {
    try {
        const result = await ReservationModel.findByIdAndUpdate(req.params.id, { status: "ยืนยันแล้ว" }, { new: true });
        if (result) {
            res.send({ status: "confirmed successfully", obj: result });
        } else {
            res.status(404).send({ status: "reservation not found" });
        }
    } catch (error) {
        res.send(error);
    }
});

router.put('/cancelReservation/:id', async function (req, res, next) {
    try {
        const result = await ReservationModel.findByIdAndUpdate(req.params.id, { status: "ยกเลิกการจองแล้ว",status_CheckIn: "checkOut" }, { new: true });
        if (result) {
            res.send({ status: "confirmed successfully", obj: result });
        } else {
            res.status(404).send({ status: "reservation not found" });
        }
    } catch (error) {
        res.send(error);
    }
});

module.exports = router;
