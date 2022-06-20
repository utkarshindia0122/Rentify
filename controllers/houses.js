const House = require('../models/house');
const { cloudinary } =require("../cloudinary"); 
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    const houses = await House.find({});
    res.render('houses/index', { houses })
}
module.exports.renderNewForm = (req, res) => {
    res.render('houses/new');
}
module.exports.createHouse = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.house.location,
        limit: 1
    }).send()
    const house = new House(req.body.house);
    house.geometry = geoData.body.features[0].geometry;
    house.images=req.files.map(f => ({ url: f.path, filename: f.filename }));
    house.author = req.user._id;
    await house.save();
    console.log(house);
    req.flash('success', 'Successfully made a new house!');
    res.redirect(`/houses/${house._id}`)
}
module.exports.showHouse = async (req, res,) => {
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
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const house = await House.findById(id)
    if (!house) {
        req.flash('error', 'Cannot find that house!');
        return res.redirect('/houses');
    }
    res.render('houses/edit', { house });
}

module.exports.updateHouse = async (req, res) => {
    const { id } = req.params;
    // console.log(req.body);
    const house = await House.findByIdAndUpdate(id, { ...req.body.house });
    const imgs=req.files.map(f => ({ url: f.path, filename: f.filename }));
    house.images.push(...imgs);
    await house.save();

    if(req.body.deleteImages){
        // deleting from cloudinary
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }

        //deleting from mongodb
       await house.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}})
        // console.log(house)
    }

   

    req.flash('success', 'Successfully updated house!');
    res.redirect(`/houses/${house._id}`)
}
module.exports.deleteHouse = async (req, res) => {
    const { id } = req.params;
    await House.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted house')
    res.redirect('/houses');
}