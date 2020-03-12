const express = require ('express');
const path = require('path');
const ejs = require ('ejs');
const bodyParser = require ('body-parser');
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
const writeData = (data) => fs.writeFileSync('./data.json', JSON.stringify(data, null, 3));

var app = express();
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use('/', express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.render('index', { data: data });
});

app.get('/add', (req, res) => {
    res.render('add')
});

app.post('/add', (req, res) => {
    data.push({
        id: req.body.id,
        string: req.body.string,
        integer: req.body.integer,
        float: req.body.float,
        date: req.body.date,
        boolean: req.body.boolean  
    })
    writeData(data);
    res.redirect('/');
});

app.get('/delete/:id', (req, res) => {
    let id = req.params.id
    data.splice(id, 1);
    writeData(data);
    res.redirect('/');
});

app.get('/edit/:id', (req, res) => {
    let id = req.params.id;
    res.render('edit', {item:{...data[id]}, id});
});

app.post('/edit/:id', (req, res) => {
    let id = req.params.id;
    const newValue = {
        string: req.body.string,
        integer: req.body.integer,
        float: req.body.float,
        date: req.body.date,
        boolean: req.body.boolean
    };
    data.splice(id, 1, newValue);
    writeData(data);
    res.redirect('/');
});

app.listen(3000, () => {
    console.log(`web ini berjalan di port 3000!`)// MASUK KE LOCALHOST 3000 DI GOOGLE
});