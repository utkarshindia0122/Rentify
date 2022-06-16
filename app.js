const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const {houseSchema, reviewSchema}=require('./schemas.js');
const catchAsync=require('./utils/catchAsync');
const ExpressError=require('./utils/ExpressError');
const methodOverride = require('method-override');
const House = require('./models/house');
const Review=require('./models/review');


//our database ,, database name -- rentify
mongoose.connect('mongodb://localhost:27017/rentify', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
     // console will show this mess age when database is connected
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// this is a middlewhere which will check the incoming data is valid or not
const validateHouse =(req,res,next)=>{
    
    const {error}=houseSchema.validate(req.body);

    if(error){
        const msg=error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg,400)
    }
    else{
        next();
    }
}
const validateReview =(req,res,next)=>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg=error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg,400)
    }
    else{
        next();
    }
}


app.get('/', (req, res) => {
    res.render('home')
});
app.get('/houses', catchAsync(async (req, res) => {
    const houses = await House.find({});
    res.render('houses/index', { houses })
}));
app.get('/houses/new', (req, res) => {
    res.render('houses/new');
})

// new house 
/// catchAsync is from utils folder it will catch any error if mongoose throw an error
app.post('/houses',validateHouse,catchAsync(async (req, res, next) => {
    
    const house = new House(req.body.house);
    await house.save();
    res.redirect(`/houses/${house._id}`)
}))

// show page
app.get('/houses/:id', catchAsync(async (req, res,) => {
     // mongoose find the house by id and save to house// populate will let access to reviews
    const house = await House.findById(req.params.id).populate('reviews');

   // houses/show is render with house varible
    res.render('houses/show', { house });
}));

// edit form 
app.get('/houses/:id/edit',catchAsync(async(req,res)=>{
    // mongoose find the house by id and save to house
    const house=await House.findById(req.params.id)
    // houses/show is render with house varible
    res.render('houses/edit',{house})
}));


// update route
app.put('/houses/:id',validateHouse,catchAsync(async(req,res)=>{
    const {id}=req.params;
    //////////////////////////////////////         ... is spread operator  it itrate on req.body.house
    const house =await House.findByIdAndUpdate(id,{...req.body.house});
    res.redirect(`/houses/${house._id}`)
}));
// delete route
app.delete('/houses/:id', catchAsync(async(req,res)=>{
    const {id}=req.params;
    await House.findByIdAndDelete(id);
    res.redirect('/houses');
}));

app.post('/houses/:id/reviews',validateReview,catchAsync(async (req,res)=>{
    const house= await House.findById(req.params.id);
    const review= new Review(req.body.review);
    house.reviews.push(review);
    await review.save();
    await house.save();
    res.redirect(`/houses/${house._id}`);
}))

app.delete('/houses/:id/reviews/:reviewId',catchAsync(async (req,res)=>{
    const { id,reviewId}=req.params;
    await House.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/houses/${id}`);
}))
///    .all is for all types of request '*' will match any route 
app.all('*',(req,res,next)=>{
   next(new ExpressError('Page not Found',404));
})
// error hendeling
app.use((err,req,res,next)=>{
    // default status code =500 and default message ='Something went wrong'
    const {statusCode =500}=err;
    if(!err.message) err.message="Something Went Wrong!!!"
    res.status(statusCode).render('error',{err});
   
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})