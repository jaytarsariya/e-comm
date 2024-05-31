const mongoose = require('mongoose');

const productschema = new mongoose.Schema({
  catid: {
    type: mongoose.Schema.Types.ObjectId,
  },
  pname: {
    type: String,
  },
  price: {
    type: Number,
  },
  qty: {
    type: Number,
  },
  img: {
    type: String,
  },
});

module.exports = new mongoose.model('product', productschema);
