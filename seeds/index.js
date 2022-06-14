const mongoose= require('mongoose');
const cities=require('./cities');
const {places,descriptors}=require('./seedHelpers');
const House=require('../models/house');
//our database ,, database name -- rentify
mongoose.connect('mongodb://localhost:27017/rentify',{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true
});

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    // console will show this message when database is connected
    console.log("Database Connected");
});



const sample=array=>array[Math.floor(Math.random()*array.length)];

const seedDB=async()=>{
    await House.deleteMany({});
    for(let i=0;i<50;i++){
        const random1000=Math.floor(Math.random()*1000);
       const rent= new House({
            location:`${cities[random1000].city},${cities[random1000].state}`,
            title:`${sample(descriptors)} ${sample(places)}`
        })
        await rent.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
});