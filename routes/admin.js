const path = require('path');

const express = require('express');

const rootDir = require('../util/path');

const router = express.Router();

router.get('/add-product', function (req, res) {
  res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
});

router.post('/product', function (req, res) {
  console.log(req.body);
  res.redirect('/');
});


module.exports = router;
