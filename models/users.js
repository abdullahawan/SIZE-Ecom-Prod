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
    // let cartProduct = this.cart.items.findIndex(cp => {
    //   return cp.product_id === product.product_id;
    // });
    let updatedCart = {items:
      [{
        product_id: product.product_id,
        timestamp: product.timestamp, 
        quantity: 1
      }]}
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
