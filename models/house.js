const mongoose= require('mongoose');
const Schema =mongoose.Schema;

const HouseSchema= new Schema({
    title:String,
    image:String,
    price:Number,
    description:String,
    location:String,
    // reviews array will store id's of reviews
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:'Review'
        }
    ]
});

module.exports=mongoose.model('House',HouseSchema);