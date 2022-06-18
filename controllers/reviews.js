const House = require('../models/house');
const Review = require('../models/review');

module.exports.createReview=async (req, res) => {
    const house = await House.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    house.reviews.push(review);
    await review.save();
    await house.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/houses/${house._id}`);
}
module.exports.deleteReview=async (req, res) => {
    const { id, reviewId } = req.params;
    await House.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/houses/${id}`);
}