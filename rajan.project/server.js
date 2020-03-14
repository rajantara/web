var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
const writeData = (data) => fs.writeFileSync('./data.json', JSON.stringify(data, null, 3));


var app = express();
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
  res.render('index', { data });
  console.log(req.url);
  const url = req.url == '/' ? '/?page1' : req.url;
});




app.get('/add', (req, res) => {
  res.render('add');
});


app.post('/add', (req, res) => {
  data.push({
      NO: req.body.NO,
      name: req.body.name,
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
  res.render('edit', {item:{...data[id]}, id})
});

app.post('/edit/:id', (req, res) => {
  let id = req.params.id;
  const newValue = {
      id: req.body.id,
      name: req.body.name,
      date: req.body.date,
      boolean: req.body.boolean  
  };
  data.splice(id, 1,newValue)
  writeData(data);
  res.redirect('/');
});


app.listen(3000, () => {
  console.log(`web ini berjalan di port 3000!`)// MASUK KE LOCALHOST 3000 DI GOOGLE
});