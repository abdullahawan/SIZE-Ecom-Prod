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
        path: '/products'
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
        path: '/products'
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
        path: '/'
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
          products: products
        });
      } else {
        products = products.Items.map(p => {
          return {
            ...p,
            quantity: req.user.cart.items.find(i => {
              return i.product_id === p.product_id;
            }).quantity,
            productPrice: req.user.cart.items.find(i => {
              return i.product_id === p.product_id;
            }).productPrice
          }
        });
        let totalPrice = 0;

        products.forEach((product) => {
          let price = product.price * product.quantity;
          totalPrice += price;
        })

        res.render('shop/cart', {
          path: '/cart',
          pageTitle: 'Your Cart',
          products: products,
          totalPrice: totalPrice
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
        orders: orders
      });
    })
    .catch(err => console.log(err));
};

exports.getCheckout = (req, res) => {
  req.user
    .getCart()
    .then(products => {
      if (products.items == 0) {
        res.render('shop/checkout', {
          path: '/checkout',
          pageTitle: 'Checkout',
          salesman: req.user.email
        });
      } else {
        products = products.Items.map(p => {
          return {
            ...p,
            quantity: req.user.cart.items.find(i => {
              return i.product_id === p.product_id;
            }).quantity,
            productPrice: req.user.cart.items.find(i => {
              return i.product_id === p.product_id;
            }).productPrice
          }
        });
        let totalPrice = 0;

        products.forEach((product) => {
          let price = product.price * product.quantity;
          totalPrice += price;
        })

        res.render('shop/checkout', {
          path: '/checkout',
          pageTitle: 'Checkout',
          products: products,
          totalPrice: totalPrice,
          salesman: req.user.email
        });
      }
    })
    .catch((err) => {
      res.redirect('/');
      console.log(err);
    });
};

exports.postOrder = (req, res) => {
  let orderTotal = req.body.orderTotal;
  let adjustedTotal = req.body.adjustedTotal;
  let checkoutNotes = req.body.checkoutNotes;


  req.user
    .addOrder(orderTotal, adjustedTotal, checkoutNotes)
    .then(result => {
      res.redirect('/orders');
    })
    .catch(err => console.log(err));
};
