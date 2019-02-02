const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const DynamoDBStore = require('connect-dynamodb')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

const docClient = new AWS.DynamoDB.DocumentClient();

const errorController = require('./controllers/error');
const User = require('./models/users');

const app = express();

const DynamoDBStoreOptions = {
  table: 'sessions',
  AWSConfigJSON: {
    region: 'us-east-1'
  }
}
const csrfProtection = csrf();
app.use(flash());

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  store: new DynamoDBStore(DynamoDBStoreOptions),
  secret: 'd1ef2473-4854-4c91-9bd3-ba924925db73',
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: 360000}
}));
app.use(csrfProtection);

app.use((req, res, next) => {
  if (!req.session.user) {
    next();
  } else {
    User.findById(req.session.user.email)
      .then(user => {
        user = user.Item;
        req.user = new User(user.name, user.email, user.password, user.resetToken, user.resetTokenExpiration, user.store_location, user.cart);
        next();
      })
      .catch((err) => {
        console.log(err)
        next();
      });
  }
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  if(typeof(req.user) !== 'undefined') {
    if(typeof(req.user.name) !== 'undefined') {
      res.locals.userName = req.user.name;
    } else {
      res.locals.userName = req.user.email;
    }
  }
  next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

app.listen(3000);
