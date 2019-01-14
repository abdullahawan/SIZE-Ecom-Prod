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
      '#t': 'timestamp'
    },
    ExpressionAttributeValues: {
      ':t': item.timestamp
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
      res.status(500).redirect('/');
    } else {
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editModeBoolean,
        product: data.Item
      });
    }
  });
  //
  // Product.findById(prodId, product => {
  //   if (!product) {
  //     return res.redirect('/');
  //   }
  //   res.render('admin/edit-product', {
  //     pageTitle: 'Edit Product',
  //     path: '/admin/edit-product',
  //     editing: editModeBoolean,
  //     product: product
  //   });
  // });
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
      '#t': 'timestamp'
    },
    ExpressionAttributeValues: {
      ':t': timeStamp
    }
  }, (err, data) =>{
    if (err) {
      console.log(err.stack);
      return res.status(500).redirect('/');
    } else {
      return res.redirect('/admin/products');
    }
  });
};

exports.getProducts = (req, res) => {
  docClient.scan({
    TableName: 'products'
  }, (err, data) => {
    if (err) {
      console.log(err.stack);
      res.status(500).redirect('/');
    } else {
      res.render('admin/products', {
        prods: data.Items,
        pageTitle: 'Shop',
        path: '/admin/products'
      });
    }
  });
};

exports.postDeleteProduct = (req, res) => {
  const prodId = req.body.productId;
  console.log('passing in ID of product');
  Product.deleteById(prodId);
  console.log('redirecting...');
  res.redirect('/admin/products');
};
