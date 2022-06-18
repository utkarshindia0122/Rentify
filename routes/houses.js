const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { houseSchema } = require('../schemas.js');
const { isLoggedIn } = require('../middleware');

const ExpressError = require('../utils/ExpressError');
const House = require('../models/house');

const validateHouse = (req, res, next) => {
    const { error } = houseSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.get('/', catchAsync(async (req, res) => {
    const houses = await House.find({});
    res.render('houses/index', { houses })
}));

router.get('/new',isLoggedIn, (req, res) => {
    res.render('houses/new');
})


router.post('/',isLoggedIn, validateHouse, catchAsync(async (req, res, next) => {
    // if (!req.body.house) throw new ExpressError('Invalid House Data', 400);
    const house = new House(req.body.house);
    house.author=req.user._id;
    await house.save();
    req.flash('success', 'Successfully made a new house!');
    res.redirect(`/houses/${house._id}`)
}))

router.get('/:id', catchAsync(async (req, res,) => {
    const house = await House.findById(req.params.id).populate('reviews').populate('author');
    if (!house) {
        req.flash('error', 'Cannot find that house!');
        return res.redirect('/houses');
    }
    res.render('houses/show', { house });
}));

router.get('/:id/edit',isLoggedIn, catchAsync(async (req, res) => {
    const house = await House.findById(req.params.id)
    if (!house) {
        req.flash('error', 'Cannot find that house!');
        return res.redirect('/houses');
    }
    res.render('houses/edit', { house });
}))

router.put('/:id',isLoggedIn, validateHouse, catchAsync(async (req, res) => {
    const { id } = req.params;
    const house = await House.findByIdAndUpdate(id, { ...req.body.house });
    req.flash('success', 'Successfully updated house!');
    res.redirect(`/houses/${house._id}`)
}));

router.delete('/:id',isLoggedIn,catchAsync(async (req, res) => {
    const { id } = req.params;
    await House.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted house')
    res.redirect('/houses');
}));

module.exports = router;