const express = require('express');
const router = express.Router();
const Chat = require('../models/chat');
const ReservationModel = require('../models/reservation');

// Create or get a chat for a specific reservation
router.get('/newChat/:id/', async (req, res) => {
    try {
        const reservationId = req.params.id;
        let chat = await Chat.findOne({ reservation: reservationId })
            .populate('restaurant', 'restaurantName restaurantIcon')
            .populate('customer');

        if (!chat) {
            const reservation = await ReservationModel.findById(reservationId);
            chat = new Chat({
                reservation: reservation._id,
                customer: reservation.username,
                restaurant: reservation.restaurant_id
            });
            await chat.save();
        }
        res.json({ status: "Chat", obj: chat });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



router.post('/postChat/:id', async (req, res) => {
    try {
        const { sender, message } = req.body;
        const chat = await Chat.findOne({ reservation: req.params.id });

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        const newMessage = { sender, message, timestamp: new Date() };
        chat.messages.push(newMessage);
        await chat.save();

        const io = req.app.get('socketio');
        io.to(req.params.id).emit('message', newMessage);
        console.log(newMessage)

        res.status(201).json(chat);
    } catch (error) {
        res.status(400).json({ message: error.message });
        console.log(error);
    }
});



module.exports = router;
