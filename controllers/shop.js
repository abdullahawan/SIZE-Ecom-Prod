const Product = require('../models/product');

const AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});

const docClient = new AWS.DynamoDB.DocumentClient();


exports.getProducts = function (req, res) {
  Product.fetchAll()
    .then((products) => {
      res.render('shop/index', {
        prods: products.Items,
        pageTitle: 'Shop',
        path: '/products',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).redirect('/products');
    });
};

exports.getProduct = (req, res) => {
  let prodId = req.params.productId;
  let productIdQuery = req.query.pId;
  let timeStampQuery = parseInt(req.query.ts);

  Product.fetchProduct(productIdQuery, timeStampQuery)
    .then(product => {
      res.render('shop/product-detail', {
        pageTitle: product.Item.title,
        product: product.Item,
        path: '/products',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).redirect('/products');
    });
};

exports.getIndex = (req, res) => {
  Product.fetchAll()
    .then((products) => {
      res.render('shop/index', {
        prods: products.Items,
        pageTitle: 'Shop',
        path: '/',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).redirect('/');
    });
};

exports.getCart = (req, res) => {
  req.user
    .getCart()
    .then(products => {
      if (products.items == 0) {
        res.render('shop/cart', {
          path: '/cart',
          pageTitle: 'Your Cart',
          products: products,
          isAuthenticated: req.session.isLoggedIn
        });
      } else {
        products = products.Items.map(p => {
          return {
            ...p,
            quantity: req.user.cart.items.find(i => {
              return i.product_id === p.product_id;
            }).quantity
          }
        });
        res.render('shop/cart', {
          path: '/cart',
          pageTitle: 'Your Cart',
          products: products,
          isAuthenticated: req.session.isLoggedIn
        });
      }
    })
    .catch((err) => {
      res.redirect('/');
      console.log(err);
    });
};

exports.postCart = (req, res) => {
  let prodId = req.body.productId;
  let timeStamp = parseInt(req.body.timeStamp);
  Product.findById(prodId, timeStamp)
    .then((product) => {
      return req.user.addToCart(product.Item, req.user);
    })
    .then((result) => {
      res.redirect('/cart');
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postCartDeleteProduct = (req, res) => {
  let prodId = req.body.productId;
  req.user
    .deleteItemFromCart(prodId, req.user)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

exports.getOrders = (req, res) => {
  req.user.getOrders()
    .then((orders) => {
      orders = orders.Items
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Orders',
        orders: orders,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

exports.postOrder = (req, res) => {
  req.user
    .addOrder()
    .then(result => {
      res.redirect('/orders');
    })
    .catch(err => console.log(err));
};

exports.getCheckout = (req, res) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout',
    isAuthenticated: req.session.isLoggedIn
  });
};
