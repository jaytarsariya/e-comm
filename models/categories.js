const mongoose = require('mongoose');

const categoryschema = new mongoose.Schema({
  catname: {
    type: String,
  },
});

module.exports = new mongoose.model('category', categoryschema);
