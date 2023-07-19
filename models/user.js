const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'I am a new user!' //default value
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post' //reference to Post Model
    }]
})

module.exports = mongoose.model('User', userSchema)