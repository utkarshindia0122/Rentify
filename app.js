const express = require('express');
const path=require('path');
const mongoose= require('mongoose');
const House=require('./models/house');
const house = require('./models/house');
const methodOverride=require('method-override');
//our database ,, database name -- rentify
mongoose.connect('mongodb://localhost:27017/rentify',{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true
});

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    // console will show this mess age when database is connected
    console.log("Database Connected");
})

const app = express();


app.set('view engine','ejs');
app.set('views', path.join(__dirname,'views'))

app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'));

app.get('/',(req,res)=>{
    res.render('home')
})

app.get('/houses',async(req,res)=>{
    const houses=await House.find({});
    res.render('houses/index',{houses})
})

app.get('/houses/new',(req,res)=>{
    res.render('houses/new');
})

app.post('/houses',async(req,res)=>{
    const house=new House(req.body.house);
    await house.save();
    res.redirect(`/houses/${house._id}`)
})

app.get('/houses/:id',async(req,res)=>{
    // mongoose find the house by id and save to house
    const house=await House.findById(req.params.id)
    // houses/show is render with house varible
    res.render('houses/show',{house})
})

// edit form 
app.get('/houses/:id/edit',async(req,res)=>{
    // mongoose find the house by id and save to house
    const house=await House.findById(req.params.id)
    // houses/show is render with house varible
    res.render('houses/edit',{house})
})

// update route
app.put('/houses/:id',async(req,res)=>{
    const {id}=req.params;
    //////////////////////////////////////         ... is spread operator  it itrate on req.body.house
    const house =await House.findByIdAndUpdate(id,{...req.body.house});
    res.redirect(`/houses/${house._id}`)
})
// delete route
app.delete('/houses/:id', async(req,res)=>{
    const {id}=req.params;
    await House.findByIdAndDelete(id);
    res.redirect('/houses');
})

app.listen(3000,()=>{
    console.log('Serving on port 3000')
})