const User = require('../models/user');
const {
    validationResult
} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_FOR_SIGNING = 'THIS IS A PRIVATE KEY WHICH IS USED FOR SIGNING';

exports.signup = async (req, res, next) => {
    const {
        email,
        name,
        password
    } = req.body;
    const errors = validationResult(req);
    try {
        if (!errors.isEmpty()) {
            const error = new Error('Validation Failed');
            error.statusCode = 422;
            error.data = errors;
            throw error;
        }
        const hashedPassword = await bcrypt.hash(password, 12)
        const newUser = new User({
            email: email,
            password: hashedPassword,
            name: name
        })
        const result = await newUser.save();
        return res.status(200).json({
            message: 'New user created!',
            userID: result._id //passed back is the user Object
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500; //server side error
        }
        next(err);
    }
}

exports.login = async (req, res, next) => {
    const {
        email,
        password
    } = req.body;
    let loadedUser;
    try {
        const user = await User.findOne({
            email: email
        })
        if (!user) {
            const error = new Error('A user with this email does not exists!');
            error.statusCode = 401; //Not Authenticated
            throw error;
        }
        loadedUser = user;
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error('Incorrect Password!');
            error.statusCode = 401; //Not Authenticated
            throw error;
        }
        // Generating a JSON Web Token
        const generatedToken = jwt.sign({ //creates a new signature
            email: loadedUser.email,
            id: loadedUser._id.toString()
        }, SECRET_FOR_SIGNING, {
            expiresIn: '1h' // token expires after 1 hr
        })

        return res.status(200).json({
            token: generatedToken,
            userId: loadedUser._id.toString() //userId looked for in Front-End
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500; //server side error
        }
        next(err);
    }
}