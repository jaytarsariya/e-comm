const router = require('express').Router();
const auth = require('../middleware/auth');
const category = require('../models/categories');
const product = require('../models/product');

// ********** VIEW CATEGORY AND PRODUCT IN INDEX PAGE *********

router.get('/', async (req, resp) => {
  const data = await category.find();
  const prod = await product.find();
  resp.render('index', { catdata: data, proddata: prod });
});

router.get('/shop', (req, resp) => {
  resp.render('shop');
});

router.get('/contact', (req, resp) => {
  resp.render('contact');
});

router.get('/detail', (req, resp) => {
  resp.render('detail');
});

router.get('/registration', (req, resp) => {
  resp.render('registration');
});
router.get('/login', (req, resp) => {
  resp.render('login');
});

router.get('/details', async (req, resp) => {
  const id = req.query.pid;
  console.log('🚀 ~ router.get ~ id:', id);
  try {
    const prod = await product.findOne({ _id: id });
    resp.render('detail', { productdata: prod });
  } catch (error) {
    console.log('UserRouter:details', error);
  }
});

//*************************user registration****************** */
const user = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/do_register', async (req, resp) => {
  try {
    const data = new user(req.body);
    console.log(data);
    await data.save();
    resp.render('login', { msg: 'Registration Successfully Done !!!' });
  } catch (error) {
    console.log('UserRouter:do_register', error);
  }
});

//  ********** do login *****************

router.post('/login', async (req, resp) => {
  try {
    const data = await user.findOne({ email: req.body.email });
    const ismatch = await bcrypt.compare(req.body.pass, data.pass);

    if (ismatch) {
      const token = await jwt.sign({ _id: data._id }, process.env.S_KEY); //  token genration
      console.log('token:=>', token);
      resp.cookie('jwt', token); //  Add coockie
      resp.redirect('/');
    } else {
      resp.render('login', { err: 'invalid credentials' });
    }
  } catch (error) {
    resp.render('login', { err: 'invalid credentials !!!' });
  }
});

//          ***************  C A R T ****************

const Cart = require('../models/cart');

router.get('/cart', auth, async (req, resp) => {
  const user = req.user;
  try {
    const cartdata = await Cart.aggregate([
      { $match: { uid: user._id } },
      {
        $lookup: {
          from: 'products',
          localField: 'pid',
          foreignField: '_id',
          as: 'product',
        },
      },
    ]);

    var sum = 0;
    for (var i = 0; i < cartdata.length; i++) {
      sum = sum + cartdata[i].total;
    }
    console.log(sum);

    resp.render('cart', {
      currentuser: user.uname,
      cartdata: cartdata,
      sum: sum,
    });
  } catch (error) {}
});

// ***************** A D D__C A R T ****************

router.get('/add_cart', auth, async (req, resp) => {
  const pid = req.query.pid; // product id and data
  const uid = req.user._id; // user id and data
  try {
    const pdata = await product.findOne({ _id: pid }); // product data
    const cartdata = await Cart.findOne({ $and: [{ pid: pid }, { uid, uid }] });

    if (cartdata) {
      var qty = cartdata.qty;
      qty++;

      var price = qty * pdata.price;
      await Cart.findByIdAndUpdate(cartdata._id, { qty: qty, total: price });
      resp.send('product added into cart !');
    } else {
      const cart = new Cart({
        uid: uid,
        pid: pid,
        qty: 1,
        price: pdata.price,
        total: pdata.price,
      });
      await cart.save();
      resp.send('product added into cart !');
    }
  } catch (error) {
    console.log(error, 'add cart error');
  }
});

//   ***************** remove cart *****************

router.get('/removecart', async (req, resp) => {
  try {
    const _id = req.query.cid;
    await Cart.findByIdAndDelete(_id);
    resp.redirect('cart');
  } catch (error) {
    console.log(error, 'remove cart error');
  }
});

router.get('/changeqty', async (req, resp) => {
  try {
    const cartid = req.query.cartid;
    const value = req.query.value;

    const cartdata = await Cart.findOne({ _id: cartid });
    const pdata = await product.findOne({ _id: cartdata.pid });
    var qty = cartdata.qty + Number(value);

    if (qty == 0) {
      await Cart.findByIdAndDelete(cartid);
    } else {
      var total = qty * pdata.price;
      await Cart.findByIdAndUpdate(cartid, { qty: qty, total: total });
      resp.send('updated data ');
    }
  } catch (error) {
    console.log(error, 'changeqty error');
  }
});

router.get('/makepayment', (req, resp) => {
  const amt = req.query.amt;
  var instance = new Razorpay({
    key_id: 'rzp_test_EIj20T3ajctasN',
    key_secret: '7jgvK7Q5zSxh4zX2DV7zXyLd',
  });

  var options = {
    amount: Number(amt) * 100, // amount in the smallest currency unit
    currency: 'INR',
    receipt: 'order_rcptid_11',
  };

  instance.orders.create(options, function (err, order) {
    resp.send(order);
  });
});

// app.listen(3000, () => {
//   console.log('server running on port : ' + 3000);
// });

router.post('/returnOrder', async (req, res) => {});
module.exports = router;
