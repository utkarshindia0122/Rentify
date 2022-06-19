const mongoose= require('mongoose');
const Review=require('./review');
const Schema =mongoose.Schema;

const HouseSchema= new Schema({
    title:String,
    images:[
        {
            url:String,
            filename:String
        }
    ],
    price:Number,
    description:String,
    location:String,
    author:{
        type: Schema.Types.ObjectId,
        ref:'User'
    },
    // reviews array will store id's of reviews
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:'Review'
        }
    ]
});


// this middlewhere is called when we are trying to delete House 
HouseSchema.post('findOneAndDelete',async function (doc) {
    // if it is deleted then we will remove all reviews it have
    if(doc){
        await Review.deleteMany({
            _id:{
                $in: doc.reviews
            }
        })
    }
})

module.exports=mongoose.model('House',HouseSchema);