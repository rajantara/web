 
const express = require("express");
const path = require("path");
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database("database.db", (err) => {
    if (err) throw err;
});

const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set("views", path.join(__dirname, "views")); // specify the views directory
app.set("view engine", "ejs");

app.use("/", express.static(path.join(__dirname, "public")));
// db.serialize(() => {
//     let sqlgetData = `SELECT * FROM bread;`
//     db.all(sqlgetData, (err, row) => {
//         if (err) throw err
//         res.render("index", { data: row });
//     })
// })
app.get("/", (req, res) => {
    let result = [];
    let dataFilter = false;
    let check = req.query;
    let sql = `SELECT * FROM bread`
    console.log(sql)

    if (req.query.check_id && req.query.id) {
        console.log('masuk id');
        result.push(`id = ${parseInt(req.query.id)}`)
        dataFilter = true;
    }

    if (req.query.check_string && req.query.string) {
        result.push(`string = '${req.query.string}'`)
        dataFilter = true;
    }

    if (req.query.check_integer && req.query.integer) {
        result.push(`integer = ${parseInt(req.query.integer)}`)
        dataFilter = true;
    }

    if (req.query.check_float && req.query.float) {
        result.push(`float = '${req.query.float}'`)
        dataFilter = true;
    }

    if (req.query.check_date && req.query.startDate && req.query.endDate) {
        result.push(`date BETWEEN '${req.query.startDate}' AND '${req.query.endDate}'`)
        dataFilter = true;
    }

    if (req.query.check_boolean && check.boolean) {
        result.push(`boolean = '${req.query.boolean}'`)
        dataFilter = true;
    }

  
    if(dataFilter == true){
        sql = sql + ` WHERE ${result.join(' AND ')}`
    }

    db.all(sql, (err, count) => {
        if (err) throw err;
        const page = req.query.page || 1;
        const limit = 3;
        const offset = (page - 1) * limit;
        const url = req.url == '/' ? '/page=1' : req.url;
        const total = count[0].total;
        console.log(total);
        
        const pages = Math.ceil(total / limit);
        console.log(pages);
        
        
        let sql = `SELECT * FROM bread`
        if (dataFilter) {
            sql = sql + ` WHERE ${result.join(' AND ')}`;
        }
        sql = sql + ` LIMIT ${limit} OFFSET ${offset}`;
        
        db.all(sql, (err, row) => {
            if (err) throw err;
            res.render("index", {
                data: row,
                query: req.query,
                page,
                pages,
                url
            });
        });
    })
});

app.get("/add", (req, res) => {
    const id = req.params.id;
    res.render("add");
});

app.get("/edit/:id", (req, res) => {
    let id = req.params.id;
    // const { string, integer, float, date, boolean } = req.body;
    let sqleditData = `SELECT * FROM bread WHERE id = ${id};`
    db.get(sqleditData, (err, row) => {
        if (err) {
            throw err;
        };
        res.render("edit", { item: row });
    });
});

app.post("/add", (req, res) => {
    const { string, integer, float, date, boolean } = req.body;
    db.serialize(() => {
        let sqladdData = `INSERT INTO bread (string, integer, float, date, boolean)
        VALUES ('${string}', '${integer}', '${float}', '${date}', '${boolean}')`
        db.run(sqladdData,(err, row) => {
            if (err) throw err;
            res.redirect("/");
        });
    });
});

app.post("/edit/:id", (req, res) => {
    const id = req.params.id;
    const { string, integer, float, date, boolean } = req.body;

    let sqleditData = `UPDATE bread SET string = '${string}', integer = '${integer}', float = '${float}', date = '${date}', boolean = '${boolean}'
        WHERE id = '${id}';`
    console.log(sqleditData);

    db.run(sqleditData, err => {
        if (err) {
            throw err;
        };
    });
    res.redirect("/");
})

app.get("/delete/:id", (req, res) => {
    const id = req.params.id;
    db.serialize(() => {
        let sqldeleteData = `DELETE FROM bread WHERE id = ${id}`

        db.run(sqldeleteData, (err, row) => {
            if (err) throw err;
            res.redirect("/");
        })
    })
})

app.listen(3000, () => {
    console.log(`web ini berjalan di port 3000!`);
});