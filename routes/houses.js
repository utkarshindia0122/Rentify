const express = require('express');
const router = express.Router();
const houses=require('../controllers/houses');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateHouse } = require('../middleware');
const multer=require('multer');
const {storage}=require('../cloudinary');
const upload=multer({storage});


const House = require('../models/house');

router.route('/')
    .get(catchAsync(houses.index))
    .post(isLoggedIn, upload.array('image'), validateHouse,catchAsync(houses.createHouse))
    
router.get('/new', isLoggedIn,houses.renderNewForm )

router.route('/:id')
    .get(catchAsync(houses.showHouse))
    .put(isLoggedIn, isAuthor, upload.array('image'),validateHouse, catchAsync(houses.updateHouse))
    .delete(isLoggedIn, isAuthor, catchAsync(houses.deleteHouse))


router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(houses.renderEditForm))




module.exports = router;