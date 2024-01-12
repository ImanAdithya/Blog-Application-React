const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt=require('jsonwebtoken');
var cookieParser = require('cookie-parser');

const secret='frhi7fhu4f';




const UserController = {
    saveUser: async function (req, res, next) {
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
    },

    loginUser: async function (req, res, next) {
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
    },

    profileDetail: function (req, res) {
        const { token } = req.cookies;
        jwt.verify(token, secret, {}, (err, info) => {
            if (err) {
                console.error(err);
                res.status(401).json({ error: 'Unauthorized' });
            } else {
                res.json(info);
            }
        });
    },


    profileLogout:function (req,res){
        res.cookie("token", "").json('ok');
    },



};

module.exports = UserController;
