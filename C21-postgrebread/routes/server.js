var express = require('express');
var router = express.Router();
var moment = require('moment');

const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
router.use(bodyParser.json())

/* GET home page. */
module.exports = (pool) => {
  router.get('/', (req, res) => {
    pool.query(() => {
      let sql = `SELECT * FROM bread`;
      pool.query(sql, (err, row) => {
        res.render('index', { row });
      })
    })
  });
 return router;
}

module.exports = (pool) => {
  router.get('/', (req, res) => {
    let result = [];
    let filterData = false;

    if (req.query.check_id && req.query.id) {
      result.push(`id = ${req.query.id}`);
      filterData = true;
    }
    if (req.query.check_string && req.query.string) {
      result.push(`string = '${req.query.string}'`);
      filterData = true;
    }
    if (req.query.check_integer && req.query.integer) {
      result.push(`integer = ${req.query.integer}`);
      filterData = true;
    }
    if (req.query.check_float && req.query.float) {
      result.push(`float = ${req.query.float}`);
      filterData = true;
    }
    if (req.query.check_date && req.query.startDate && req.query.endDate) {
      result.push(`date BETWEEN '${req.query.startDate}' AND '${req.query.endDate}'`);
      filterData = true;
      console.log(req.query)
    }
    if (req.query.check_boolean && req.query.boolean) {
      result.push(`boolean = '${req.query.boolean}'`);
      filterData = true;
      console.log(req.query);
    }

    // count
    let sql = `SELECT COUNT(*) AS total FROM bread`;
    if (filterData) {
      sql += ` WHERE ${result.join(' AND ')}`
    }
    pool.query(sql, (err, count) => {
      const rows = count.rows[0].total;
      console.log('Total ' + rows);
      const page = req.query.page || 1;
      console.log('Page ' + page);
      const limit = 5;
      const offset = (page - 1) * limit;
      console.log('Offset ' + offset);
      const url = req.url == '/' ? '/?page=1' : req.url;
      console.log('Url ' + url);
      const pages = Math.ceil(rows / limit);
      console.log('Pages ' + pages);
      sql = `SELECT * FROM bread`;
      if (filterData) {
        sql += ` WHERE ${result.join(' AND ')}`
      }
      sql += ` LIMIT ${limit} OFFSET ${offset}`;
      console.log('SQL ' + sql)

      pool.query(sql, (err, row) => {
        if (err) throw err;
        res.render('index', {
          data: row.rows,
          page,
          pages,
          query: req.query,
          url,
          moment
        });
      });
    });
  });

  // add
  router.get('/add', (req, res, next) => {
    res.render('add');
  });

  router.post('/add', (req, res, next) => {
    let sqlAdd = `INSERT INTO bread (string, integer, float, date, boolean) VALUES($1,$2,$3,$4,$5)`;
    let insert = [req.body.string, req.body.integer, req.body.float, req.body.date, req.body.boolean]
    pool.query(sqlAdd, insert, (err) => {
      if (err) throw err;
      res.redirect('/');
    })
  });

  // edit
  router.get('/edit/:id', (req, res, next) => {
    let id = req.params.id;
    let sqlEdit = `SELECT * FROM bread WHERE id=$1`;
    pool.query(sqlEdit, [id], (err, item) => {
      if (err) throw err;
      console.log(sqlEdit);
      res.render('edit', { item: item.rows[0] });
    })
  });

  router.post('/edit/:id', (req, res, next) => {
    let id = req.params.id;
    let sqlEdit = `UPDATE bread 
    SET string =$1, integer=$2, float =$3, date=$4, boolean=$5 WHERE id=$6`;
    let insert = [req.body.string, req.body.integer, req.body.float, req.body.date, req.body.boolean, id];
    pool.query(sqlEdit, insert, (err) => {
      if (err);
      console.log(err);
      res.redirect('/');
    })
  })

  router.get('/delete/:id', (req, res, next) => {
    let id = req.params.id;
    let sqlDel = `DELETE FROM bread WHERE id = $1`;
    pool.query(sqlDel, [id], (err) => {
      if (err) throw err;
      res.redirect('/')
    })
    console.log('Delete success');
  })
  return router;
};