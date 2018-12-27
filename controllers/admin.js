const Product = require('../models/product');

exports.postAddProduct = function (req, res) {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const cost = req.body.cost;
  const price = req.body.price;

  const product = new Product(title, imageUrl, cost, price);
  product.save();
  res.redirect('/');
};

exports.getAddProduct = function (req, res) {
  res.render('admin/add-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    formCSS: true,
    productCSS: true,
    activeAddProduct: true
  });
};

exports.getProducts = (req, res) => {
  Product.fetchAll((products) => {
    res.render('admin/admin-product-list', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products',
    });
  });
};
