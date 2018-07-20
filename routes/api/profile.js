const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
// load profile model
const Profile = require('../../models/Profile');
//load user model
const User = require('../../models/user');

// @route get api/profile/test
//@desc tests profile route
//@access Public
router.get('/test', (req,res)=>{res.json({msg: "Profile Works"});
});

// we have payload / token with users information so id in url is not needed
// no need for/:id
// @route get api/profile
//@desc get current user profile
//@access private


router.get('/',(req,res)=> {

});



module.exports = router;