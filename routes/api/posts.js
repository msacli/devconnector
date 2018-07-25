const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// post model
const Post = require('../../models/Post');

// profile model
 const Profile = require('../../models/Profile');

// validation post

const validatePostInput = require('../../validation/post');

// @route get api/posts/test
//@desc tests post route
//@access Public
router.get('/test', (req,res)=>{
    res.json({msg: "Posts Works"});
});

// @route GET api/posts
//@desc GET POSTS
//@access public

router.get('/', (req,res)=> {
    Post.find()
        .sort({date: -1})
        .then(posts => res.json(posts))
        .catch(err => res.status(404));
});

// @route GET api/posts/:id
//@desc GET single POSTS
//@access public

router.get('/:id', (req,res)=> {
    Post.findById(req.params.id)
        
        .then(post => res.json(post))
        .catch(err => res.status(404).json({nopostfound: 'No post found with that id'}));
});


// @route post api/posts
//@desc create post route
//@access Private
router.post('/', passport.authenticate('jwt', {session:false}), 
(req,res)=> {

    const {errors, isValid} = validatePostInput(req.body);

    // ceck validation
    if(!isValid) {
        // if any errors send 400 with erros obj

        return res.status(400).json(errors);
    }

    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    });

    newPost
    .save()
    .then(post=> res.json(post))
    .catch(err => res.status(404).json({nopostsfound: 'no posts found'}));

});



// @route delete post api/posts/:id
//@desc delete post route
//@access Private

router.delete('/:id', passport.authenticate('jwt', {session: false}), (req,res) => {
    // burada aslında sadece Post model ile iiş yapılabilir ama bir şekilde güvenlik nedeniyle olduğunu iddia ederek Profile model kullanıyor. soru cevaplarda sace postla yapılabilinir deniyor. traversy pek girmiyor konuya. yorumlarda ise boşuna profile modeli ile database yoruyoruz diyor
    // olay şu eğer o user.id için profile varsa post delete devam ediyor yoksa o user yok yani sakat işler dönüyor olabilir.
    Profile.findOne({user: req.user.id})
        .then(profile => {
            Post.findById(req.params.id)
            .then(post => { 
                // check for post owner
                if(post.user.toString() !== req.user.id) {
                   
                    return res.status(401).json({ notauthorized: ' User not authorized'});
                }

                // delete
                post.remove().then(()=> res.json({success: true}));

            })
            .catch(err => res.status(404).json({postnotfound: 'No post found'}))
        })
});

// @route  post api/posts/like/:id ++ id is the post to like
//@desc like post
//@access Private

router.post('/like/:id', passport.authenticate('jwt', {session: false}), (req,res) => {
   
    Profile.findOne({user: req.user.id})
        .then(profile => {
            Post.findById(req.params.id)
            .then(post => { 
                // check if the user has already liked the post. check by filter
                if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
                    return res.status(400).json({ alreadyliked: 'User already liked this post'});
                }

                // add user id to likes array
                post.likes.unshift({ user: req.user.id});

                post.save().then(post => res.json(post));

            })
            .catch(err => res.status(404).json({postnotfound: 'No post found'}))
        })
});


// @route  post api/posts/unlike/:id ++ id is the post to like
//@desc unlike post
//@access Private

router.post('/unlike/:id', passport.authenticate('jwt', {session: false}), (req,res) => {
   
    Profile.findOne({user: req.user.id})
        .then(profile => {
            Post.findById(req.params.id)
            .then(post => { 
                // check the expression is == 0 so person has not liked this post then he can not unlike something that has not liked in the past
                if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
                    return res.status(400).json({ notliked: 'You have not yet liked this post'});
                }

                // we will remove like so we need the index so we can remove it
                
                const removeIndex = post.likes  
                    .map(item=> item.user.toString())
                    .indexOf(req.user.id);
                
                // splice out of array the like
                post.likes.splice(removeIndex,1);
                post.save().then(post => res.json(post));

            })
            .catch(err => res.status(404).json({postnotfound: 'No post found'}))
        })
});


// @route  post api/posts/comment/:id ++ id is the post to comment
//@desc add comment to post
//@access Private

router.post('/comment/:id', passport.authenticate('jwt', {session:false}), (req,res)=> {

    const {errors, isValid} = validatePostInput(req.body);

    // ceck validation
    if(!isValid) {
        // if any errors send 400 with erros obj

        return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
        .then(post => {
            const newComment = {
                text: req.body.text,
                name: req.body.name,
                avatar: req.body.avatar,
                user: req.user.id
            }

            // add to comments arrray
            post.comments.unshift(newComment);

            // save
            post.save().then(post => res.json(post))
        })
        .catch(err => res.status(404).json({postnotfound: 'no post found'}));

});

// @route  DELETE api/posts/comment/:id/:comment_id 
//@desc DELETE  comment to post
//@access Private

router.delete(
    '/comment/:id/:comment_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
      Post.findById(req.params.id)
        .then(post => {
          // Check to see if comment exists
          if (
            post.comments.filter(
              comment => comment._id.toString() === req.params.comment_id
            ).length === 0
          ) {
            return res
              .status(404)
              .json({ commentnotexists: 'Comment does not exist' });
          }
  
          // Get remove index
          const removeIndex = post.comments
            .map(item => item._id.toString())
            .indexOf(req.params.comment_id);
  
          // Splice comment out of array
          post.comments.splice(removeIndex, 1);
  
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
    }
  );
  


module.exports = router;