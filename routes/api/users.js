const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

// @route get api/users/test
//@desc tests users route
//@access Public


router.get('/test', (req,res)=>{
    res.json({msg: "Users Works"});
});

// @route get api/users/register
//@desc register users route
//@access Public

router.post('/register', (req,res)=>{
    // form will be sent containn email and password to register
    // encrypt and save user to mongo db
    User.findOne({email: req.body.email})
        .then(user => {
            if(user) {
                return res.status(400).json({email: "Email already exists"});
            } else {
                const avatar = gravatar.url(req.body.email, {
                    s: '200', // size
                    r: 'pg', // rating
                    d: 'mm' // default
                });

                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    // avatar: avatar, es6 sayesinde direk avatar
                    // diye yazilabilir. bu arada gravatar diye bir servis internetten veriyor tanımlı
                    avatar,
                    password: req.body.password
                });

                bcrypt.genSalt(10, (err , salt) => {
                    bcrypt.hash(newUser.password, salt, (err,hash)=> {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user=> res.json(user))
                            .catch(err => console.log(err));
                    });
                });
            }
        });
        
});


// @route get api/users/login
//@desc login user / returnin jwt token
//@access Public

router.post('/login', (req,res)=>{
    // send form containing email and password control if it matchs with mongo db users

    const email = req.body.email;
    const password = req.body.password;

    // find user bty email. use user model findOne
    // findOone({ email:email}) is normal but es6 enables {email}
    User.findOne({email})
        .then(user =>{
            // check if user exits
            if(!user) {
                return res.status(404).json({email: 'User not found'});
            }

            // check password is corret but mongo password is encrypt so bcrypt.compare
            // compare returns boolean true or false and we call this value isMatch
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if(isMatch) {
                        // user matched

                        // create payload for token

                        const payload = { id: user.id, name: user.name, avatar: user.avatar}

                        // sign token jwt.sign  accpet payload, secret key and expiration time  and callback
                        // jwt.sign accepts info and spits out token
                        // info accepted is payload also send a secret key and expiration date
                        jwt.sign(payload, 
                            keys.secrerOrKey, 
                            {expiresIn: 3600}, 
                            (err,token)=> {
                                res.json({
                                    success: 'true',
                                    token: 'Bearer ' + token
                                });
                            });
                    } else {
                        return res.status(400). json({password: 'Password incorrect'});
                    }
                })

        })

});

// @route get api/users/current
//@desc return current user
//@access private

router.get('/current', passport.authenticate('jwt', {session:false}), 
(req,res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    });
});

module.exports = router;