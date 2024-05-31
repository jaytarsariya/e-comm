const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userschema = new mongoose.Schema({
  uname: {
    type: String,
    // required:true
  },
  email: {
    type: String,
    // required:true
  },
  phone: {
    type: String,
    // required:true
  },
  pass: {
    type: String,
    // required:true
  },
});

userschema.pre('save', async function () {
  try {
    if (this.isModified('pass')) {
      this.pass = await bcrypt.hash(this.pass, 10);
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = new mongoose.model('EshopUser', userschema);
