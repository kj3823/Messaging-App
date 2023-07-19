const fs = require('fs');
const path = require('path');
const {
    validationResult
} = require('express-validator');
const post = require('../models/post');

const Post = require('../models/post');
const {
    clear
} = require('console');
const User = require('../models/user');

const ITEMS_PER_PAGE = 2;
exports.getPosts = (req, res, next) => {
    const currentPage = req.query.page || 1;
    let totalItems;
    //we wont return res.render;
    Post.countDocuments()
        .then(count => {
            totalItems = count;
            return Post.find()
                .skip((currentPage - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE) //returning the promise
        })
        .then(posts => {
            return res.status(200).json({
                posts: posts,
                message: 'Fetched posts successfully!',
                totalItems: totalItems
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500; //server side error
            }
            next(err);
        })
};

exports.createPost = (req, res, next) => {
    //console.log(title, content);
    //create in database
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed, entered data is incorrect');
        error.statusCode = 422;
        throw error;
        //will try to reach the next error handling middleware, execution will stop
    }
    if (!req.file) {
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }
    const imageURL = req.file.path; //holds the file to the path
    const title = req.body.title;
    const content = req.body.content;
    console.log(req.userID)
    const newPost = new Post({
        title: title,
        content: content,
        creator: req.userID,
        imageURL: imageURL
    });
    let creator;
    newPost
        .save()
        .then(result => {
            console.log(result);
            return User.findById(req.userID);
        })
        .then(user => {
            creator = user;
            user.posts.push(newPost); //appending the new post
            return user.save();
        })
        .then(result => {
            res.status(201).json({
                message: "Succesfully created post!",
                post: newPost,
                creator: {
                    _id: creator._id,
                    name: creator.name
                }
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500; //server side error
            }
            next(err);
        });

};

exports.getPost = (req, res, next) => {
    const postID = req.params.postID;
    Post.findById(postID)
        .then(post => {
            if (!post) {
                const error = new Error('Could not find post');
                err.statusCode = 404;
                throw error;
            }
            return res.status(200).json({
                message: 'Post fetched',
                post: post
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.updatePost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed, entered data is incorrect');
        error.statusCode = 422;
        throw error;
        //will try to reach the next error handling middleware, execution will stop
    }
    const postID = req.params.postID;
    const {
        title,
        content
    } = req.body;
    let imageURL = req.body.image; // no new file was picked.
    if (req.file) { // if new file was added
        imageURL = req.file.path;
    }
    if (!imageURL) {
        const error = new Error('No file was picked');
        error.statusCode = 422;
        throw error;
    }
    Post.findById(postID)
        .then(post => {
            if (!post) {
                const error = new Error('No post was found');
                error.statusCode = 404;
                throw error;
            }
            if (post.creator.toString() !== req.userID) //checking if that user created the post.
            {
                const error = new Error('Not Authorized');
                error.statusCode = 403;
                throw error;
            }
            if (imageURL !== post.imageURL) //imageURL changed, so we delete the previous image from the filesystem
            {
                clearImage(post.imageURL)
            }
            post.title = title;
            post.imageURL = imageURL;
            post.content = content;
            return post.save();
        })
        .then(result => {
            return res.status(200).json({
                message: 'Post updated!',
                post: result
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.deletePost = (req, res, next) => {
    const postID = req.params.postID;
    Post.findById(postID)
        .then(post => {
            if (!post) {
                const error = new Error('No post was found');
                error.statusCode = 404;
                throw error;
            }
            //Check if the creator is the currently loggedIn user.
            clearImage(post.imageURL);
            return Post.findById(postID)
        })
        .then(result => {
            return res.status(200).json({
                message: 'Deleted post!'
            })
        })
}

const clearImage = filePath => { // a general function
    filePath = path.join(__dirname, '..', filePath)
    fs.unlink(filePath, err => console.log(err));
}