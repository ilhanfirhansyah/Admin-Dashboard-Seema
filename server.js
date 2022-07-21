const path = require('path');
const express = require('express');
const cors = require('cors');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();
const session = require('express-session');

hbs.registerHelper('inc', function (value, options) {
  return parseInt(value) + 1;
});

const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'semaa_coffee_db',
});

conn.connect((err) => {
  if (err) throw err;
  console.log('Mysql Connected...');
});

app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  })
);

app.set('view engine', 'hbs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/assets', express.static(__dirname + '/public'));

var corsOptions = {
  origin: ['http://localhost:8000'],
};

app.use(cors(corsOptions));

app.get('/', (req, res) => {
  res.render('index');
});
// Read Product dan Teams
app.get('/products', (req, res) => {
  let sql = 'SELECT * FROM products';
  conn.query(sql, (err, results) => {
    if (err) throw err;
    res.render('product', {
      results: results,
    });
  });
});

app.get('/teams', (req, res) => {
  let sql = 'SELECT * FROM teams';
  conn.query(sql, (err, results) => {
    if (err) throw err;
    res.render('team', {
      results: results,
    });
  });
});

// Create Product and Team
app.post('/products/store', (req, res) => {
  let data = { nama: req.body.nama, deskripsi: req.body.deskripsi, thumbnail: '' };
  let sql = 'INSERT INTO products SET ?';
  conn.query(sql, data, (err, results) => {
    if (err) throw err;
    res.redirect('/products');
  });
});

app.post('/teams/store', (req, res) => {
  let data = { Nama: req.body.Nama, Nomor_Mahasiswa: req.body.Nomor_Mahasiswa, Role: req.body.Role };
  let sql = 'INSERT INTO teams SET ?';
  conn.query(sql, data, (err, results) => {
    if (err) throw err;
    res.redirect('/teams');
  });
});

// Delete Product and Team
app.get('/products/destroy/:id', (req, res) => {
  const id = req.params.id;
  let sql = 'DELETE FROM products WHERE id_product=' + id + '';
  conn.query(sql, (err, results) => {
    if (err) throw err;
    res.redirect('/products');
  });
});

app.get('/teams/destroy/:id', (req, res) => {
  const id = req.params.id;
  let sql = 'DELETE FROM teams WHERE id_mhs=' + id + '';
  conn.query(sql, (err, results) => {
    if (err) throw err;
    res.redirect('/teams');
  });
});

// Select Product and Teams
app.get('/products/:id', (req, res) => {
  const id = req.params.id;
  let sql = 'SELECT * FROM products WHERE id_product=' + id + '';
  conn.query(sql, (err, results) => {
    if (err) throw err;
    res.send(results[0]);
  });
});

app.get('/teams/:id', (req, res) => {
  const id = req.params.id;
  let sql = 'SELECT * FROM teams WHERE id_mhs=' + id + '';
  conn.query(sql, (err, results) => {
    if (err) throw err;
    res.send(results[0]);
  });
});

// Update Product and Teams
app.post('/products/update', (req, res) => {
  let sql = "UPDATE products SET nama='" + req.body.edit_nama + "', deskripsi='" + req.body.edit_deskripsi + "' WHERE id_product=" + req.body.id;
  conn.query(sql, (err, results) => {
    if (err) throw err;
    res.redirect('/products');
  });
});

app.post('/teams/update', (req, res) => {
  let sql = "UPDATE teams SET Nama='" + req.body.edit_nama + "',Nomor_Mahasiswa='" + req.body.edit_NoMhs + "', Role='" + req.body.edit_role + "' WHERE Id_mhs=" + req.body.id;
  conn.query(sql, (err, results) => {
    if (err) throw err;
    res.redirect('/teams');
  });
});
// app.get('/teams', (req, res) => {
//   res.render('team');
// });

app.get('/login', function (req, res) {
  // Render login template
  res.render('login');
});

app.post('/auth', function (request, response) {
  // Capture the input fields
  let username = request.body.username;
  let password = request.body.password;
  // Ensure the input fields exists and are not empty
  if (username && password) {
    // Execute SQL query that'll select the account from the database based on the specified username and password
    conn.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
      // If there is an issue with the query, output the error
      if (error) throw error;
      // If the account exists
      if (results.length > 0) {
        // Authenticate the user
        request.session.loggedin = true;
        request.session.username = username;
        // Redirect to home page
        response.redirect('/');
      } else {
        response.send('Incorrect Username and/or Password!');
      }
      response.end();
    });
  } else {
    response.send('Please enter Username and Password!');
    response.end();
  }
});

app.get('/logout', function (req, res) {
  req.session.loggedin = false;
  req.session.username = '';
  res.redirect('/login');
});

app.listen(8000, () => {
  console.log('Server is running at port 8000');
});
