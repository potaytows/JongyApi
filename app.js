var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var http = require('http');
var socketIo = require('socket.io');

var imageRouter = require('./routes/image');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var tablesRouter = require('./routes/tables');
var menusRouter = require('./routes/menu');
var addonRouter = require('./routes/addon');
var cartRouter = require('./routes/cart');
var reserveRouter = require('./routes/reservation');
var chatRoutes = require('./routes/chat');
var restaurantsRouter = require('./routes/restaurants');
const Chat = require('./models/chat'); 
var app = express();

var server = http.createServer(app);
var io = socketIo(server, {
    cors: {
        origin: "*", // Adjust this as per your requirement
        methods: ["GET", "POST"]
    }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(express.json());
app.use((req, res, next) => {
    req.io = io;
    next();
});
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/tables', tablesRouter);
app.use('/restaurants', restaurantsRouter);
app.use('/image', imageRouter);
app.use('/menus', menusRouter);
app.use('/addons', addonRouter);
app.use('/cart', cartRouter);
app.use('/reservation', reserveRouter);
app.use('/chat', chatRoutes);

app.set('socketio', io);

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        console.log('Joined room:', roomId);
    });

    socket.on('chatMessage', async (data) => {
        console.log('Received chatMessage:', data);
        try {
            let chat = await Chat.findOne({ reservation: data.reservationID });
            if (!chat) {
                
                console.error('Chat not found');
                return;
            }

            const newMessage = { sender: data.sender, message: data.message, timestamp: new Date() };
            chat.messages.push(newMessage);
            await chat.save(); 

            io.to(data.reservationID).emit('message', newMessage);

            socket.broadcast.to(data.reservationID).emit('notification', {
            sender: data.sender,
            message: 'You have a new message',
            timestamp: newMessage.timestamp
        });
        } catch (error) {
            console.error('Error saving message to database:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const uri = "mongodb+srv://finalProject:EFpeUnSek3qtwsMf@cluster0.xoovbhu.mongodb.net/finalProject?retryWrites=true&w=majority";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        server.listen(8000, () => {
            console.log('API is running on port 8000 http://localhost:8000/');
        });
    })
    .catch((err) => console.log(err));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
