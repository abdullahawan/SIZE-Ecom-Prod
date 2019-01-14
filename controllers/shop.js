const Product = require('../models/product');
const Cart = require('../models/cart');

const AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});

const docClient = new AWS.DynamoDB.DocumentClient();


exports.getProducts = function (req, res) {
  docClient.scan({
    TableName: 'products'
  }, (err, data) => {
    if (err) {
      console.log(err.stack);
      res.status(500).redirect('/');
    } else {
      res.render('shop/index', {
        prods: data.Items,
        pageTitle: 'Shop',
        path: '/'
      });
    }
  });
};

exports.getProduct = (req, res) => {
  const prodId = req.params.productId;
  Product.findById(prodId, product => {
    res.render('shop/product-detail', {
      pageTitle: product.title,
      product: product,
      path: '/products'
    });
  });
};

exports.patchGetProduct = function (req, res) {
  docClient.scan({
    TableName: 'products'
  }, (err, data) => {
    if (err) {
      console.log(err.stack);
      res.status(500).redirect('/');
    } else {
      res.render('shop/index', {
        prods: data.Items,
        pageTitle: 'Shop',
        path: '/'
      });
    }
  });
};

exports.getIndex = (req, res) => {
  docClient.scan({
    TableName: 'products'
  }, (err, data) => {
    if (err) {
      console.log(err.stack);
      res.status(500).redirect('/');
    } else {
      res.render('shop/index', {
        prods: data.Items,
        pageTitle: 'Shop',
        path: '/'
      });
    }
  });
};

exports.getCart = (req, res) => {
  Cart.getCart(cart => {
    Product.fetchAll((products) => {
      const cartProducts = [];
      for (product of products) {
        const cartProductData = cart.products.find((prod => prod.id === product.id));
        if (cartProductData) {
          cartProducts.push({
            productData: product,
            qty: cartProductData.qty
          });
        }
      }
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: cartProducts
      });
    });
  });
};

exports.postCart = (req, res) => {
  const prodId = req.body.productId;
  Product.findById(prodId, (product) => {
    Cart.addProduct(prodId, product.price);
  });
  res.redirect('/cart');
};

exports.postCartDeleteProduct = (req, res) => {
  const prodId = req.body.productId;
  Product.findById(prodId, (product) => {
    Cart.deleteProduct(prodId, product.price);
    res.redirect('/cart');
  });
};

exports.getOrders = (req, res) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Order(s)'
  });
};

exports.getCheckout = (req, res) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
