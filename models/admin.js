const mongoose = require('mongoose');

const adminschema = new mongoose.Schema(
  {
    uname: {
      type: String,
    },
    pass: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = new mongoose.model('Admin', adminschema);
