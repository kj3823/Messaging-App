const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const MONGODB_CONNECTION_URL = "mongodb+srv://jjink3823:5lZcBVolSZRMiGv2@cluster0.s0o5toi.mongodb.net/messages?authMechanism=SCRAM-SHA-1";

const FILE_STORAGE = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images') //points at images folder
    },
    filename: (req, file, callback) => {
        callback(null, new Date().toISOString() + '-' + file.originalname);
    }
});

const FILE_FILTER = (req, file, callback) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png')
        callback(null, true);
    else {
        callback(null, false)
    }
}

const app = express();

//app.use(bodyParser.urlencoded) //used for holding data in the form of x-www-form-urlencoded

app.use(bodyParser.json()) //application/json (Used for parsing incoming JSON data)
app.use(multer({
    storage: FILE_STORAGE,
    fileFilter: FILE_FILTER
}).single('image')) //field name is image in the incoming request

app.use('/images', express.static(path.join(__dirname, 'images'))); //serving the images statically

app.use((req, res, next) => { //general middleware (for CORS) Cross-Origin Resourse Sharing
    res.setHeader('Access-Control-Allow-Origin', '*'); // determines which address clients can access the server from, * represents all
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE'); // detemines which methods the client can use
    //OPTIONS IS AN IMPORTANT HEADER FOR CORS
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); //determines which headers can be set by the client.
    next();
})

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => { //error handling middleware
    console.log(error);
    const statusCode = error.statusCode || 500; //500 if undefined
    const message = error.message; //defualt (when string passed to error constructor)
    const errorData = error.data; //passing the error data to the frontend
    return res.status(statusCode).json({
        message: message,
        data: errorData
    });
})

mongoose.connect(MONGODB_CONNECTION_URL)
    .then(result => {
        console.log('Connected to MongoDB');
        const nodeServer = app.listen(8080); //returns our server
        const io = require('socket.io')(nodeServer, {
            cors: {
                origin: 'http://localhost:3000',
                methods: ['GET', 'POST']
            }
        }); //passing the server to the function, returns a socket.io object
        io.on('connection', socket => {
            console.log("Client Connected");
        })
    })
    .catch(err => console.log(err));