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
            let categoryIds = [];
            let photoIds = [];

            categories.forEach((category) => {
              if (category) {
                category['apiUrl'] = config.API_URL;
                categoryIds.push(category._id);
              }
            });

            db.Banner.find({ category: { $in: categoryIds } }).then(
              (banners) => {
                banners.forEach((banner) => {
                    banner['apiUrl'] = config.API_URL;
                });

                db.Producer.find().then(
                  (producers) => {
                    producers.forEach((producer) => {
                      producer['apiUrl'] = config.API_URL;
                    });

                    res.render('index', { 
                      title: 'Express123',
                      parentCategories: categoryService.findParentCategory(categories, products),
                      products: products,
                      categoriesViewInMenu: categories.filter(x => x.viewInMenu),
                      apiUrl: config.API_URL,
                      banners: banners,
                      producers: producers
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
