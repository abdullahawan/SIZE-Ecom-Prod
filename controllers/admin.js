const Product = require('../models/product');

const uuidv4 = require('uuid/v4');
const moment = require('moment');
const async = require('async');
const _ = require('underscore');
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = 'products';

exports.getAddProduct = function (req, res) {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = function (req, res) {
  let product_id = uuidv4();
  let timeStamp = moment().unix();
  let title = req.body.title;
  let imageUrl = req.body.imageUrl;
  let cost = req.body.cost;
  let price = req.body.price;
  let userId = req.user.userId;

  docClient.put({
    TableName: tableName,
    Item: {
      "product_id": product_id,
      "timestamp": timeStamp,
      "title": title,
      "image_url": imageUrl,
      "cost": cost,
      "price": price,
      "user_id": userId
    }
  }, (err, data) =>{
    if (err) {
      console.log(err.stack);
      return res.status(500).redirect('/');
    } else {
      return res.redirect('/');
    }
  });
};


exports.getEditProduct = function (req, res) {
  const editMode = req.query.edit;
  const editModeBoolean = (editMode === 'true');
  if (!editModeBoolean) {
    return res.redirect('/');
  }
  let prodId = req.params.productId;
  let productIdQuery = req.query.pId;
  let timeStampQuery = parseInt(req.query.ts);
  docClient.get({
    TableName: tableName,
    Key: {
      "product_id": productIdQuery,
      "timestamp": timeStampQuery
    }
  }, (err, data) => {
    if (err) {
      console.log(err.stack);
      res.status(500).redirect('/admin/products');
    } else {
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editModeBoolean,
        product: data.Item
      });
    }
  });
};

exports.postEditProduct = function (req, res) {
  let product_id = req.body.productId;
  let timeStamp = parseInt(req.body.timeStamp);
  let title = req.body.title;
  let imageUrl = req.body.imageUrl;
  let cost = req.body.cost;
  let price = req.body.price;

  docClient.put({
    TableName: tableName,
    Item: {
      "product_id": product_id,
      "timestamp": timeStamp,
      "title": title,
      "image_url": imageUrl,
      "cost": cost,
      "price": price
    },
    ConditionExpression: '#t = :t',
    ExpressionAttributeNames: {
      '#t': 'product_id'
    },
    ExpressionAttributeValues: {
      ':t': product_id
    }
  }, (err, data) =>{
    if (err) {
      console.log(err.stack);
      return res.status(500).redirect('/admin/products');
    } else {
      return res.redirect('/admin/products');
    }
  });
};

exports.getProducts = (req, res) => {
  Product.fetchAll()
    .then((products) => {
      res.render('admin/products', {
        prods: products.Items,
        pageTitle: 'Shop',
        path: '/admin/products'
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).redirect('/admin/products');
    });
};

exports.postDeleteProduct = (req, res) => {
  let prodId = req.body.productId;
  let timeStamp = parseInt(req.body.timeStamp);

  Product.deleteProduct(prodId, timeStamp)
    .then(() => {
      res.redirect('products');
    })
    .catch((err) => {
      console.log(err);
      res.status(500).redirect('products');
    });
};
