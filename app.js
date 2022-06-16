const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const House = require('./models/house');

mongoose.connect('mongodb://localhost:27017/rentify', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


app.get('/', (req, res) => {
    res.render('home')
});
app.get('/houses', async (req, res) => {
    const houses = await House.find({});
    res.render('houses/index', { houses })
});
app.get('/houses/new', (req, res) => {
    res.render('houses/new');
})

app.post('/houses', async (req, res) => {
    const house = new House(req.body.house);
    await house.save();
    res.redirect(`/houses/${house._id}`)
})

app.get('/houses/:id', async (req, res,) => {
    const house = await House.findById(req.params.id)
    res.render('houses/show', { house });
});

app.get('/houses/:id/edit', async (req, res) => {
    const house = await House.findById(req.params.id)
    res.render('houses/edit', { house });
})

app.put('/houses/:id', async (req, res) => {
    const { id } = req.params;
    const house = await House.findByIdAndUpdate(id, { ...req.body.house });
    res.redirect(`/houses/${house._id}`)
});

app.delete('/houses/:id', async (req, res) => {
    const { id } = req.params;
    await House.findByIdAndDelete(id);
    res.redirect('/houses');
})



app.listen(3000, () => {
    console.log('Serving on port 3000')
})