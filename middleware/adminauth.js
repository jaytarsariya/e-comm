const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

const auth = async (req, resp, next) => {
  try {
    const mytoken = req.cookies.Ajwt;
    console.log('admin token:', mytoken);
    const verifytoken = await jwt.verify(mytoken, process.env.A_KEY);

    if (verifytoken) {
      const admindata = await Admin.findOne({ _id: verifytoken._id });
      req.Admin = admindata;
      req.token = mytoken;

      next();
    }
  } catch (error) {
    resp.render('Alogin', { err: 'please login first !!' });
  }
};

module.exports = auth;
