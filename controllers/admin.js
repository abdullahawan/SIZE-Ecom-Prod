const Product = require('../models/product');

exports.getAddProduct = function (req, res) {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = function (req, res) {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const cost = req.body.cost;
  const price = req.body.price;

  const product = new Product(null, title, imageUrl, cost, price);
  product.save();
  res.redirect('/');
};

exports.getEditProduct = function (req, res) {
  const editMode = req.query.edit;
  const editModeBoolean = (editMode === 'true');
  if (!editModeBoolean) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId, product => {
    if (!product) {
      return res.redirect('/');
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editModeBoolean,
      product: product
    });
  });
};

exports.postEditProduct = (req, res) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImageUrl = req.body.imageUrl;
  const updatedCost = req.body.cost;
  const updatedPrice = req.body.price;
  const updatedProduct = new Product(prodId, updatedTitle, updatedImageUrl, updatedCost, updatedPrice);
  updatedProduct.save();
  res.redirect('/admin/products');
};

exports.getProducts = (req, res) => {
  Product.fetchAll((products) => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products',
    });
  });
};

exports.postDeleteProduct = (req, res) => {
  const prodId = req.body.productId;
  console.log('passing in ID of product');
  Product.deleteById(prodId);
  console.log('redirecting...');
  res.redirect('/admin/products');
};
