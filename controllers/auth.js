const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const User = require('../models/users');

const uuidv4 = require('uuid/v4');
const AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});

const docClient = new AWS.DynamoDB.DocumentClient();

exports.getLogin = (req, res) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message
  });
};

exports.getSignup = (req, res) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'signup',
    errorMessage: message
  });
};

exports.postLogin = (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  User.findById(email)
    .then(user => {
      if (Object.entries(user).length === 0 && user.constructor === Object) {
        req.flash('error', 'Invalid email or password.');
        res.redirect('/login');
      } else {
        bcrypt.compare(password, user.Item.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user.Item;
            return req.session.save((err) => {
              if (err) console.log(err);
              else return res.redirect('/');
            });
          }
          req.flash('error', 'Invalid email or password.');
          res.redirect('/login');
        })
        .catch((err) => {
          console.log(err);
          res.redirect('/login');
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.redirect('/login');
    })
};

exports.postSignup = (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let confirmPassword = req.body.confirmPassword;
  let storeLocation = req.body.storeLocation;

  User.findById(email)
    .then(userDoc => {
      if (Object.entries(userDoc).length !== 0) {
        req.flash('error', 'User already exists.');
        setTimeout(() => {
          return res.redirect('/signup');
        }, 50);
      } else {
        bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
          const user = new User(email, hashedPassword, null, null, storeLocation);
          return user.save();
        });
        res.redirect('/login');
      }
    })
    .catch(err => console.log(err));
}

exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.log(err);
    else res.redirect('/');
  });
};

exports.getReset = (req, res) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render('auth/reset', {
    path:'/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  });
}

exports.postReset = (req, res) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }

    const token = buffer.toString('hex');
    User.findById(req.body.email)
      .then(user => {
        if (Object.entries(userDoc).length === 0) {
          req.flash('error', 'No user found');
          return res.redirect('/reset');
        } else {
          user.resetToken = token;
          user.resetTokenExpiration = Date.now() * 3600000;
          return user.save();
        }
      })
      .then(result => {
        console.log(result);
        //send email to user here
      })
      .catch(err => console.log(err));
  });
}

exports.getNewPassword = (req, res) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render('auth/new-password', {
    path:'/new-password',
    pageTitle: 'New Password',
    errorMessage: message
  });
}
