const AWS = require('aws-sdk');
const uuidv4 = require('uuid/v4');

AWS.config.update({region: 'us-east-1'});

const docClient = new AWS.DynamoDB.DocumentClient();

const tableName = 'users';


class User {
  constructor(userId, username, email, cart) {
    this.userId = userId;
    this.username = username;
    this.email = email;
    this.cart = cart;
  }

  save() {
    return docClient.put({
        TableName: tableName,
        Item: {
          "user_id": uuidv4(),
          "username": name,
          "email": email
        }
      }, (err, data) => {
        if (err) {
          return console.log(err);
        } else {
          console.log('success');
          return data.Item;
        }
      }).promise();
  }

  addToCart(product, user) {
    let cartProductIndex = this.cart.items.findIndex(cp => {
      return cp.product_id === product.product_id;
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        product_id: product.product_id,
        timestamp: product.timestamp,
        quantity: newQuantity
      });
    }

    const updatedCart = {
      items: updatedCartItems
    }

    return docClient.put({
      TableName: tableName,
      Item: {
        "user_id": user.userId,
        "username": user.username,
        "cart": updatedCart
      },
      ConditionExpression: '#id = :id',
      ExpressionAttributeNames: {
        '#id': 'user_id'
      },
      ExpressionAttributeValues: {
        ':id': user.userId
      }
    }, (err, data) => {
      if (err) return err;
      else return data;
    }).promise();

  }

  getCart() {
    let productIds = this.cart.items.map(i => {
      return i.product_id;
    });
    let productObject ={};
    let index = 0;

    productIds.forEach((value) => {
      index++;
      var productKey = ":pid"+index;
      productObject[productKey.toString()] = value;
    });

    return docClient.scan({
      TableName: 'products',
      FilterExpression: "product_id IN ("+Object.keys(productObject).toString()+ ")",
      ExpressionAttributeValues: productObject
    }, (err, data) => {
      if (err) return err;
      else  return data
    }).promise();

  }

  static findById(userId, userName) {
    return docClient.get({
      TableName: tableName,
      Key: {
        "user_id": userId,
        "username": userName
      }
    }, (err, data) => {
      if (err) console.log(err);
      else {
        return data.Item;
      }
    }).promise();
  }

}

module.exports = User;
