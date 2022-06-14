const express = require('express');
const path=require('path');
const mongoose= require('mongoose');
const House=require('./models/house');
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

app.get('/',(req,res)=>{
    res.render('home')
})

app.get('/houses',async(req,res)=>{
    const houses=await House.find({});
    res.render('houses/index',{houses})
})


app.listen(3000,()=>{
    console.log('Serving on port 3000')
})