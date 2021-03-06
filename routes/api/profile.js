const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const validateProfileInput = require('../../validation/profile');

const validateExperienceInput = require('../../validation/experience');

const validateEducationInput = require('../../validation/education');


// load profile model
const Profile = require('../../models/Profile');
//load user model
const User = require('../../models/User');



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
// ther are important to things in req object one is req.user which contains user from token the second is req.body

router.get('/', passport.authenticate('jwt', {session: false}), (req,res)=> {
    const errors = {};

    Profile.findOne({ user: req.user.id})
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if(!profile) {
                errors.noprofile = 'There is no profile for this user';
                return res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json(err));
});


// @route get api/profile/all
//@desc get all profiles
//@access public
// 

router.get('/all', (req,res)=>{
    const errors = {};
    Profile.find()
    .populate('user', ['name', 'avatar'])
    .then(profiles => {
        if(!profiles) {
            errors.noprofile = 'There are no profiles'
            res.status(404).json()
        }
        res.json(profiles);
    })
    .catch(err => res.status(404).json({profile: 'There are no profiles'}));
    
});




// @route get api/profile/handle/:handle
//@desc get profile by handle
//@access public
// 
// 

router.get('/handle/:handle', (req,res) =>{
    const errors = {};
    Profile.findOne({ handle: req.params.handle})
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if(!profile) {
                errors.noprofile ='There is no profile for this user';
                res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json(err));
});


// @route get api/profile/user/:user_id
//@desc get profile by user_id
//@access public
// 
// 

router.get('/user/:user_id', (req,res) =>{
    const errors = {};
    Profile.findOne({ user: req.params.user_id})
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if(!profile) {
                errors.noprofile ='There is no profile for this user';
                res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json({profile: 'There is no profile for this user'}));
});


// @route post api/profile
//@desc create or edit user profile
//@access private
// ther are important to things in req object one is req.user which contains user from token the second is req.body
// req.body will contain many fields for profile
// but user will be in profileFields.user = req.user.id I guess this is in jwt token

router.post(
    '/', 
    passport.authenticate('jwt', {session: false}), 
    (req,res)=> {

    const {errors, isValid} = validateProfileInput(req.body);

    // check validation

    if(!isValid) {
        // isValid exists then return errors

        return res.status(400).json(errors);
    }

    const profileFields = {};
    profileFields.user = req.user.id;
    if(req.body.handle) profileFields.handle = req.body.handle;
    if(req.body.company) profileFields.company = req.body.company;
    if(req.body.website) profileFields.website = req.body.website;
    if(req.body.location) profileFields.location = req.body.location;
    if(req.body.bio) profileFields.bio = req.body.bio;
    if(req.body.status) profileFields.status = req.body.status;
    if(req.body.githubusername) profileFields.githubusername = req.body.githubusername;
    // skills will come as comma seperated values so we need to split
    if(req.body.skills !== 'undefined') {
        profileFields.skills = req.body.skills.split(',');
    }

    // social is an object that contains fields so create an object named social and put youtube facebook etc in the key values of social object

    profileFields.social = {};

    if(req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if(req.body.instagram) profileFields.social.instagram = req.body.instagram;
    
    Profile.findOne({ user: req.user.id})
        .then(profile => {
            if(profile) {
                // if profile exists then we are meant to update it as it is the same route
                Profile.findOneAndUpdate(
                    { user: req.user.id }, 
                    {$set: profileFields},
                    {new: true}
                )
                .then(profile => res.send(profile));
            } else {
                // create a brand new profile

                // check if handle exists
                Profile.findOne({handle: profileFields.handle})
                    .then(profile => {
                        if(profile) {
                            errors.handle = 'That handle already exists';
                            res.status(400).json(errors);
                        }

                        // save profile
                        new Profile(profileFields).save()
                            .then(profile => res.send(profile))
                    });
            }
        })

});


// @route post api/profile/experience
//@desc Add expreince to profile
//@access private
// ther are important to things in req object one is req.user which contains user from token the second is req.body

router.post('/experience', passport.authenticate('jwt', {session: false}), (req,res)=> {

    const {errors, isValid} = validateExperienceInput(req.body);

    // check validation

    if(!isValid) {
        // isValid exists then return errors

        return res.status(400).json(errors);
    }


    Profile.findOne({user: req.user.id})
    .then(profile => {
        const newExp = {
            title:req.body.title,
            company: req.body.company,
            location: req.body.location,
            from: req.body.from,
            to: req.body.to,
            current: req.body.current,
            description: req.body.description
        };

        // add to experience array to add to beggining of array unshift do not use push it will add to end
        profile.experience.unshift(newExp);

        profile.save().then(profile => res.json(profile));

    })
});

// @route post api/profile/education
//@desc Add education to profile
//@access private
// ther are important to things in req object one is req.user which contains user from token the second is req.body

router.post('/education', passport.authenticate('jwt', {session: false}), (req,res)=> {

    const {errors, isValid} = validateEducationInput(req.body);

    // check validation

    if(!isValid) {
        // isValid exists then return errors

        return res.status(400).json(errors);
    }


    Profile.findOne({user: req.user.id})
    .then(profile => {
        const newEdu = {
            school:req.body.school,
            degree: req.body.degree,
            fieldofstudy: req.body.fieldofstudy,
            from: req.body.from,
            to: req.body.to,
            current: req.body.current,
            description: req.body.description
        };

        // add to experience array to add to beggining of array unshift do not use push it will add to end
        profile.education.unshift(newEdu);

        profile.save().then(profile => res.json(profile));

    })
});


module.exports = router; 