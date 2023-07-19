const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.js')
const isAuth = require('../middleware/isAuth');
const {
    body
} = require('express-validator');

const User = require('../models/user')

router.put('/signup', [
    body('email')
    .isEmail().withMessage('Please enter a valid Email')
    .custom((email, {
        req
    }) => {
        return User.findOne({
                email: email
            })
            .then(userDocument => {
                if (userDocument) {
                    return Promise.reject('E-Mail address already exists')
                }
            })
    })
    .normalizeEmail(),
    body('password')
    .trim()
    .isLength({
        min: 5
    }),
    body('name')
    .trim()
    .notEmpty()
], authController.signup);

router.post('/login', authController.login);


module.exports = router;