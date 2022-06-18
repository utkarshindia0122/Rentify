const House = require('../models/house');
module.exports. index=async (req, res) => {
    const houses = await House.find({});
    res.render('houses/index', { houses })
}
module.exports.renderNewForm=(req, res) => {
    res.render('houses/new');
}
module.exports.createHouse=async (req, res, next) => {
    const house = new House(req.body.house);
    house.author = req.user._id;
    await house.save();
    req.flash('success', 'Successfully made a new house!');
    res.redirect(`/houses/${house._id}`)
}
module.exports.showHouse=async (req, res,) => {
    const house = await House.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    
    if (!house) {
        req.flash('error', 'Cannot find that house!');
        return res.redirect('/houses');
    }
    res.render('houses/show', { house });
}
module.exports.renderEditForm=async (req, res) => {
    const { id } = req.params;
    const house = await House.findById(id)
    if (!house) {
        req.flash('error', 'Cannot find that house!');
        return res.redirect('/houses');
    }
    res.render('houses/edit', { house });
}

module.exports.updateHouse=async (req, res) => {
    const { id } = req.params;
    const house = await House.findByIdAndUpdate(id, { ...req.body.house });
    req.flash('success', 'Successfully updated house!');
    res.redirect(`/houses/${house._id}`)
}
module.exports.deleteHouse=async (req, res) => {
    const { id } = req.params;
    await House.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted house')
    res.redirect('/houses');
}