let express = require('express');
let router = express.Router();

let categoryService = require('../services/category');

module.exports = (app, db) => {
  /* GET home page. */
  router.get('/', (req, res) => {
    db.Category.find().then(
      (categories) => {
        res.render('index', { 
          title: 'Express123',
          parentCategories: categoryService.findParentCategory(categories)
        });
      }
    ).catch(
      (err) => {
        console.log(err);
        res.render('index', { 
          title: 'Express123',
          categories: [],
          errors: err
        });
      }
    );
  });

  app.use('/', router);
};
