const router = require('express').Router();
const Admin = require('../models/admin');
const jwt = require('jsonwebtoken');
const aauth = require('../middleware/adminauth');
const multer = require('multer');

// ********************* multer ****************************
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/product_img');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.jpg');
  },
});

var upload = multer({
  storage: storage,
});

router.get('/dashboard', aauth, (req, resp) => {
  resp.render('dashboard');
});
router.get('/Alogin', (req, resp) => {
  resp.render('ad_login');
});

// ********************* admin login ****************************
router.post('/do_adminlogin', async (req, resp) => {
  try {
    const admin = await Admin.findOne({ uname: req.body.uname });

    if (admin.pass === req.body.pass) {
      const gentoken = await jwt.sign({ _id: admin._id }, process.env.A_KEY); // genrate token
      resp.cookie('Ajwt', gentoken);
      resp.redirect('dashboard');
    } else {
      resp.render('ad_login', { err: 'invalid details !!!' });
    }
  } catch (error) {
    resp.render('ad_login', { err: 'invalid details !!' });
  }
});

//  ****************** Admin LOGOUT *******************************

router.get('/admin_logout', async (req, resp) => {
  try {
    console.log('hello admin logout');
    resp.clearCookie('Ajwt'); // delete cookies
    resp.render('ad_login');
  } catch (error) {
    console.log(error);
  }
});

router.get('/products', aauth, async (req, resp) => {
  try {
    resp.render('products');
  } catch (error) {
    console.log(error);
  }
});

//**************************** Category ****************************
const category = require('../models/categories');
const product = require('../models/product');

router.get('/category', aauth, async (req, resp) => {
  try {
    const data = await category.find();
    resp.render('category', { catdata: data });
  } catch (error) {
    console.log('admin.js category page ni error che', error);
  }
});

router.post('/add_category', aauth, async (req, resp) => {
  try {
    const cat = await category(req.body);
    await cat.save();
    resp.redirect('category');
  } catch (error) {
    console.log(error);
  }
});

//  ***************** PRODUCT *****************************
const Product = require('../models/product');

router.get('/product', aauth, async (req, resp) => {
  try {
    const data = await category.find();
    const prod = await product.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'catid',
          foreignField: '_id',
          as: 'category',
        },
      },
    ]);

    resp.render('products', { catdata: data, proddata: prod });
  } catch (error) {
    console.log(error);
  }
});

router.post('/add_product', upload.single('file'), async (req, resp) => {
  try {
    const prod = new Product({
      catid: req.body.catid,
      pname: req.body.pname,
      price: req.body.price,
      qty: req.body.qty,
      img: req.file.filename,
    });

    await prod.save();
    resp.redirect('product');
  } catch (error) {
    console.log('add_product', error);
  }
});

//  ******************* ALL USER DATA VIEW ON ADMIN SIDE *********

const user = require('../models/user');

router.get('/viewuser', async (req, resp) => {
  try {
    const data = await user.find();
    resp.render('users', { userdata: data });
  } catch (error) {
    console.log('viewuser', error);
  }
});

module.exports = router;
