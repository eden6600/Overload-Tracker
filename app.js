const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const app = express();

// Handlebars Middleware
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Index Route
app.get('/', (req, res) => {
  const title = 'Welcome';
  res.render('Index', {
    title: title
  });
});

// About Route
app.get('/about', (req, res) => {
  res.render('about');
})

// Active Workout Route
app.get('/active_Workout', (req, res) => {
  res.render('active_Workout');
})

// History Route
app.get('/history', (req, res) => {
  res.render('history');
})

const port = process.env.PORT || 5000;

app.listen(port, () => {  
  console.log(`Server started on port ${port}`);
});