var express = require('express');
const mongoose = require("mongoose");
var router = express.Router();
const User=require("../model/User");
const Post=require("../model/Post");
const UserController=require('../controller/UserController');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

var cookieParser = require('cookie-parser');
const multer = require("multer");

const secret='frhi7fhu4f';

const upload=multer({dest:'uploads/'})

const fs=require('fs');



router.post('/register', async (req,res) => {
    try {
        const { username, password } = req.body;

        // Generate a random salt
        const salt = bcrypt.genSaltSync(10);


        // Hash the password
        const hashedPassword = bcrypt.hashSync(password, salt);

        // Create a new user with the hashed password
        const user = await User.create({
            username: username,
            password: hashedPassword,
        });

        res.status(200).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong!' });
    }
});
//router.post('/register', UserController.saveUser);

router.post('/login', async (req,res) => {
    try {
        const { username, password } = req.body;

        const userDoc = await User.findOne({ username: username });


        const passwordMatch = bcrypt.compareSync(password, userDoc.password);

        if (passwordMatch) {
            jwt.sign({username,id:userDoc._id},secret,{},(err,token) =>{
                if (err) throw err;
                res.cookie('token',token).json({
                    id:userDoc._id,
                    username,
                });
            });
            // res.status(200).json({passwordMatch});
        } else {
            // Passwords do not match
            res.status(401).json("Wrong Credentials");
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong!' });
    }
});
//router.post('/login', UserController.loginUser);

router.get('/profile', (req,res) => {
    const { token } = req.cookies;
    jwt.verify(token, secret, {}, (err, info) => {
        if (err) {
            console.error(err);
            res.status(401).json({ error: 'Unauthorized' });
        } else {
            res.json(info);
        }
    });
});
//router.get('/profile', UserController.profileDetail);

router.post('/logout', (req,res) => {
    res.cookie("token", "").json('ok');
});
//router.post('/logout', UserController.profileLogout);

router.post('/createPost', upload.single('file'), async (req,res) => {

    const {originalname,path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path+'.'+ext;
    fs.renameSync(path, newPath);

    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err,info) => {
        if (err) throw err;
        const {title,summary,content,cover} = req.body;
        const postDoc = await Post.create({
            title,
            summary,
            content,
            cover:newPath,
            author:info.id,
        });
        res.json(postDoc);
    });

});
//router.post('/createPost', UserController.createPost);

router.get('/post', async (req,res) => {
    res.json(
        await Post.find()
            .populate('author', ['username'])
            .sort({createdAt: -1})
            .limit(20)
    );
});

router.get('/post/:id', async (req, res) => {
    const {id} = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    res.json(postDoc);
});

router.put('/post', upload.single('file'), async (req, res) => {
    let newPath = null;
    if (req.file) {
        const { originalname, path } = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        newPath = path + '.' + ext;
        fs.renameSync(path, newPath);
    }

    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) throw err;
        const { id, title, summary, content } = req.body;
        const postDoc = await Post.findById(id);
        const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
        if (!isAuthor) {
            return res.status(400).json('You are not the author');
        }

        // Use updateOne or updateMany as per your needs
        await Post.updateOne(
            { _id: id }, // Assuming your post has an _id field
            {
                title,
                summary,
                content,
                cover: newPath ? newPath : postDoc.cover,
            }
        );

        // Fetch the updated post after the update
        const updatedPost = await Post.findById(id);

        res.json(updatedPost);
    });
});






module.exports = router;

