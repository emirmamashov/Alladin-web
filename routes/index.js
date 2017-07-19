let express = require('express');
let router = express.Router();

let categoryService = require('../services/category');

module.exports = (app, db) => {
  let config = app.get('config');
  /* GET home page. */
  router.get('/', (req, res) => {
    db.Category.find().then(
      (categories) => {
        console.log(config.API_URL);
        db.Product.find().then(
          (products) => {
            res.render('index', { 
              title: 'Express123',
              parentCategories: categoryService.findParentCategory(categories, products),
              products: products,
              categoriesViewInMenu: categories.filter(x => x.viewInMenu),
              apiUrl: config.API_URL
            });
          }
        ).catch(
          (err) => {
            console.log(err);
            res.render('index', { 
              title: 'Express123',
              parentCategories: categoryService.findParentCategory(categories),
              products: [],
              errors: err,
              apiUrl: config.API_URL
            });
          }
        );
      }
    ).catch(
      (err) => {
        console.log(err);
        res.render('index', { 
          title: 'Express123',
          categories: [],
          errors: err,
          apiUrl: config.API_URL
        });
      }
    );
  });

  app.use('/', router);
};
