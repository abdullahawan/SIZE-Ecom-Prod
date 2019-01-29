const AWS = require('aws-sdk');
const uuidv4 = require('uuid/v4');
const moment = require('moment');

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
    if (typeof(this.cart) === 'undefined' || this.cart.length == 0) {
      this.cart = {items: []}
    }
    let cartProductIndex = this.cart.items.findIndex(cp => {
      return cp.product_id === product.product_id;
    });
    let newQuantity = 1;

    let updatedCartItems = [...this.cart.items];

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

    return docClient.update({
      TableName: tableName,
      Key: {
        "user_id": user.userId,
        "username": user.username
      },
      UpdateExpression: "set #cart = :cart",
      ConditionExpression: '#id = :id',
      ExpressionAttributeNames: {
        '#id': 'user_id',
        '#cart': 'cart'
      },
      ExpressionAttributeValues: {
        ':id': user.userId,
        ':cart': updatedCart
      }
    }, (err, data) => {
      if (err) return err;
      else return data;
    }).promise();

  }

  getCart() {
    if (typeof(this.cart) === 'undefined' || this.cart.items == 0) {
      this.cart = {items: []};
      let promise = new Promise((resolve, reject) => {
        resolve(this.cart);
      });

      return promise;
    } else {
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

  }

  deleteItemFromCart(prodId, user) {
    let updatedCartItems = this.cart.items.filter(item => {
      return item.product_id !== prodId;
    });

    return docClient.update({
      TableName: tableName,
      Key: {
        "user_id": user.userId,
        "username": user.username
      },
      UpdateExpression: "set #cart.#items = :cart",
      ConditionExpression: '#id = :id',
      ExpressionAttributeNames: {
        '#id': 'user_id',
        '#cart': 'cart',
        '#items': 'items'
      },
      ExpressionAttributeValues: {
        ':id': user.userId,
        ':cart': updatedCartItems
      }
    }, (err, data) => {
      if (err) return err;
      else return data;
    }).promise();
  }

  addOrder() {
    let orderId = uuidv4();
    let timeStamp = moment().unix();

    return this.getCart().then((products) => {
      return products = products.Items.map(p => {
        return {
          ...p,
          quantity: this.cart.items.find(i => {
            return i.product_id === p.product_id;
          }).quantity
        }
      });
    }).then((products) => {
      const item = {
        "order_id": orderId,
        "timestamp": timeStamp,
        "user": {
          "user_id": this.userId,
          "username": this.username,
          "email": this.email
        },
        "items": products
      }

      return docClient.put({
        TableName: 'orders',
        Item: item
      }, (err, data) => {
        if (err) return err;
        else {
          let updatedCart = [];
          docClient.update({
            TableName: tableName,
            Key: {
              "user_id": this.userId,
              "username": this.username
            },
            UpdateExpression: "set #cart.#items = :cart",
            ConditionExpression: '#id = :id',
            ExpressionAttributeNames: {
              '#id': 'user_id',
              '#cart': 'cart',
              '#items': 'items'
            },
            ExpressionAttributeValues: {
              ':id': this.userId,
              ':cart': updatedCart
            }
          }, (err, data) => {
            if (err) return err;
            else return data;
          }).promise();
        }
      }).promise();
    })

  }

  getOrders() {
    return docClient.scan({
      TableName: 'orders',
    }, (err, data) => {
      if (err) return err;
      else return data
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
