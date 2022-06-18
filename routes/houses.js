const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateHouse } = require('../middleware');

const House = require('../models/house');

router.get('/', catchAsync(async (req, res) => {
    const houses = await House.find({});
    res.render('houses/index', { houses })
}));

router.get('/new', isLoggedIn, (req, res) => {
    res.render('houses/new');
})


router.post('/', isLoggedIn, validateHouse, catchAsync(async (req, res, next) => {
    const house = new House(req.body.house);
    house.author = req.user._id;
    await house.save();
    req.flash('success', 'Successfully made a new house!');
    res.redirect(`/houses/${house._id}`)
}))

router.get('/:id', catchAsync(async (req, res,) => {
    const house = await House.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    console.log(house);
    if (!house) {
        req.flash('error', 'Cannot find that house!');
        return res.redirect('/houses');
    }
    res.render('houses/show', { house });
}));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const house = await House.findById(id)
    if (!house) {
        req.flash('error', 'Cannot find that house!');
        return res.redirect('/houses');
    }
    res.render('houses/edit', { house });
}))

router.put('/:id', isLoggedIn, isAuthor, validateHouse, catchAsync(async (req, res) => {
    const { id } = req.params;
    const house = await House.findByIdAndUpdate(id, { ...req.body.house });
    req.flash('success', 'Successfully updated house!');
    res.redirect(`/houses/${house._id}`)
}));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await House.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted house')
    res.redirect('/houses');
}));

module.exports = router;