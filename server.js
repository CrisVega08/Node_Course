const express = require('express');
const helmet = require('helmet')
const hbs = require('hbs');
const fs = require('fs');
const csp = require('express-csp-header');

const cspMiddleware = csp({
    policies: {
      'default-src': [csp.NONE],
      'script-src': [csp.NONCE],
      'style-src': [csp.NONCE],
      'img-src': [csp.SELF],
      'font-src': [csp.NONCE, 'fonts.gstatic.com'],
      'object-src': [csp.NONE],
      'block-all-mixed-content': true,
      'frame-ancestors': [csp.NONE]
    }
  });

const port = process.env.PORT || 3000;
var app = express();

app.use(helmet());
app.use(cspMiddleware);
hbs.registerPartials(__dirname + '/views/partials')
app.set('view engine', 'hbs');
app.use((req, res, next) => {
  var now = new Date().toString();
  var log = `${now}: ${req.method} ${req.url}`;

  console.log(log);
  fs.appendFile('server.log', log + '\n', err =>{
    if(err) console.log("Unable to append to server.log")
  });
  next();
});

// app.use((req, res, next) => {
//   res.render('maintenance.hbs');
// });

app.use(express.static(__dirname + '/public'));

hbs.registerHelper('getCurrentYear', () => {
  return new Date().getFullYear();
});

hbs.registerHelper('screamIt', (text) => {
  return text.toUpperCase();
});

app.get('/', (req, res) => {
  res.render('home.hbs', {
    pageTitle: 'Home Page',
    welcomeMessage: 'Welcome to my website'
  });
});

app.get('/about', (req, res) => {
  res.render('about.hbs', {
    pageTitle: 'About Page'
  });
});

app.get('/projects', (req, res) => {
  res.render('projects.hbs', {
    pageTitle: 'Projects'
  });
});

app.get('/aa', (req, res) => {
  console.log(req.nonce)
    res.send(`
      <h1>Hello World</h1>
      <style nonce=${req.nonce}>
        .blue { background: cornflowerblue; color: white; }
      </style>
      <p class="blue">This should have a blue background because of the loaded styles</p>
      <style>
        .red { background: maroon; color: white; }
      </style>
      <p class="red">This should not have a red background, the styles are not loaded because of the missing nonce.</p>
    `);
  });
// /bad - send back json with errorMessage
app.get('/bad', (req, res) => {
  res.send({
    errorMessage: 'Unable to handle request'
  });
});

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
