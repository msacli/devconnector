const express = require('express');
const router = express.Router();

// @route get api/profile/test
//@desc tests profile route
//@access Public

router.get('/test', (req,res)=>{
    res.json({msg: "Profile Works"});
});

module.exports = router;