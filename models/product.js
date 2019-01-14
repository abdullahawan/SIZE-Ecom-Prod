const Cart = require('./cart');

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

docClient = new AWS.DynamoDB.DocumentClient();

module.exports = class Product {
  constructor(id, title, imageUrl, cost, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.cost = cost;
    this.price = price;
  }

  save() {

  }

  static deleteById(id) {

  }

  static fetchAll() {

  }

  static findById(id) {

  }
};
