var express = require('express');
var router = express.Router();

module.exports = (app, db) => {
  /* GET users listing. */
  router.get('/register', function(req, res, next) {
    res.render('users/register');
  });

  app.use('/users', router);
};
