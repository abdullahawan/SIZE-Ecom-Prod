const User = require('../models/users');
const AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});

const docClient = new AWS.DynamoDB.DocumentClient();

exports.getLogin = (req, res) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: req.session.isLoggedIn
  });
};

exports.postLogin = (req, res) => {
  User.findById('123456adveeace', 'abdullahawan')
    .then(user => {
      req.session.isLoggedIn = true;
      req.session.user = user.Item;
      req.session.save((err) => {
        if (err) console.log(err);
        else res.redirect('/');
      });
    })
    .catch(err => {
      console.log(err);
      res.redirect('/');
    })
};

exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    else res.redirect('/');
  });
};
