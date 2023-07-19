const express = require('express');
const {
    check, //checks everything including params
    body //only checks body
} = require('express-validator')

const isAuth = require('../middleware/isAuth');

const router = express.Router();

const feedController = require('../controllers/feed');

router.get('/status', isAuth, feedController.getStatus)
router.patch('/updateStatus', isAuth, feedController.updateStatus)

router.get('/posts', isAuth, feedController.getPosts);
router.post('/post', isAuth, [
    body('title')
    .trim()
    .isLength({
        min: 5
    }),
    body('content')
    .trim()
    .isLength({
        min: 5
    })
], feedController.createPost);

router.get('/post/:postID', isAuth, feedController.getPost);
router.put('/post/:postID', isAuth, [
    body('title')
    .trim()
    .isLength({
        min: 5
    }),
    body('content')
    .trim()
    .isLength({
        min: 5
    })
], feedController.updatePost);
router.delete('/post/:postID', isAuth, feedController.deletePost);

module.exports = router;