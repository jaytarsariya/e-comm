const express = require('express');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const hbs = require('hbs');
const bodyparser = require('body-parser');
var cookieParser = require('cookie-parser');

const port = process.env.PORT;
const url = process.env.URL;
mongoose.connect(url).then(() => {
  console.log('db connected');
});

app.use(cookieParser());
app.use(bodyparser.urlencoded({ extended: false })); // body- parser
const publicpath = path.join(__dirname, '../public');
const viewpath = path.join(__dirname, '../templates/views');
const partialspath = path.join(__dirname, '../templates/partials');

app.set('view engine', 'hbs');
app.set('views', viewpath);
hbs.registerPartials(partialspath); // partials path
app.use(express.static(publicpath));

app.use('/', require('../router/userRouter'));
app.use('/api', require('../router/admin'));

app.listen(port, () => {
  console.log(`server running on port no ${port}`);
});
