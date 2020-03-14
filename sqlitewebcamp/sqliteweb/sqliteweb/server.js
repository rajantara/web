const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const moment = require('moment')

const app = express()

const port = 3000

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(path.join(__dirname, 'db/siswa.db'));

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  console.log(req.url);
  const {cid, id, cnama, nama, cumur, umur, ctinggi, tinggi, ctanggallahir, startdate, enddate, cismenikah, ismenikah} = req.query
  const url = req.url == '/' ? '/?page=1' : req.url;

  let params = [];

  if(cid && id){
    params.push(`id=${id}`);
  }

  if(cnama && nama){
    params.push(`nama like '%${nama}%'`);
  }

  if(cumur && umur){
    params.push(`umur=${umur}`);
  }

  if(ctinggi && tinggi){
    params.push(`tinggi=${tinggi}`);
  }

  if(ctanggallahir && startdate && enddate){
    params.push(`tanggallahir between '${startdate}' and '${enddate}'`);
  }

  if(cismenikah && ismenikah){
    params.push(`ismenikah=${ismenikah}`);
  }

  const page = req.query.page || 1;
  const limit = 3;
  const offset = (page - 1) * limit

  let sql = 'select count(id) as total from siswa';

  if(params.length > 0){
    sql += ` where ${params.join(' AND ')}`
  }
  console.log(sql);
  db.all(sql, (err, data)=>{
    if(err) return res.send(err)
    if(data.length == 0) return res.send('data tidak ditemukan')
    const total = data[0].total
    const pages = Math.ceil(total / limit)

    sql = 'select * from siswa'

    if(params.length > 0){
      sql += ` where ${params.join(' AND ')}`
    }

    sql+= ' limit ? offset ?';
    console.log(sql);
    db.all(sql,[limit, offset], (err, data)=>{
      if(err) return res.send(err)
      res.render('list', {
        data,
        moment,
        pages,
        page,
        query: req.query,
        url
      })
    })
  })
})

app.get('/add', (req, res) => {
  res.render('form', {
    title: "form tambah",
    item: {}
  })
})

app.post('/add', (req, res) => {
  db.run("INSERT INTO siswa(nama, umur, tinggi, tanggallahir, ismenikah) values(?,?,?,?,?)", [req.body.nama, parseInt(req.body.umur), parseFloat(req.body.tinggi), req.body.tanggallahir, JSON.parse(req.body.ismenikah)], (err) => {
    if(err) return res.send(err)
    res.redirect('/')
  })
})

app.get('/edit/:id', (req, res) => {
  db.all("SELECT * FROM siswa WHERE id=?", [parseInt(req.params.id)], (err, data) => {
    if(err) return res.send(err)
    if(data.length == 0) return res.send('data tidak ditemukan')
    res.render('form', {
      title: "form edit",
      item: data[0]
    })
  })
})

app.post('/edit/:id', (req, res) => {
  db.run("UPDATE siswa SET nama=?, umur=?, tinggi=?, tanggallahir=?, ismenikah=? WHERE id=?", [req.body.nama, parseInt(req.body.umur), parseFloat(req.body.tinggi), req.body.tanggallahir, JSON.parse(req.body.ismenikah), parseInt(req.params.id)], (err) => {
    if(err) return res.send(err)
    res.redirect('/')
  })
})

app.get('/delete/:id', (req, res) => {
  db.run("DELETE FROM siswa WHERE id=?", [parseInt(req.params.id)], (err) => {
    if(err) return res.send(err)
    res.redirect('/')
  })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
