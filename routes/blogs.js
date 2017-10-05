let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let ObjectId = mongoose.Types.ObjectId;

let categoryService = require('../services/category');
let chunkService = require('../services/chunk');

module.exports = (app, db) => {
  let config = app.get('config');
  /* GET home page. */
  router.get('/', (req, res) => {
    categoryService.getCategoriesWithChilds(db).then(
      (data) => {
          db.Blog.find().then(
            (blogs) => {
                res.render('blogs/index', {
                    parentCategories: data.parentCategories || [],
                    categoriesViewInMenu: data.parentCategories.filter(x => x.viewInMenu) || [],
                    blogs: blogs
                });
            }
          ).catch(
              (err) => {
                  console.log(err);
                  res.render('blogs/index', { 
                    title: 'Express123',
                    parentCategories: data.parentCategories || [],
                    products: [],
                    errors: err
                  });
              }
          );
      }
    ).catch(
      (err) => {
        console.log(err);
        res.render('blogs/index', { 
          title: 'Express123',
          categories: [],
          errors: err,
          apiUrl: config.API_URL
        });
      }
    );
  });

  router.get('/:name/:id', (req, res) => {
    let id = req.params.id;
    if (!id || !ObjectId.isValid(id)) {
        return res.render('blogs/details', { 
            title: 'Express123',
            categories: [],
            errors: 'parameters is not valid',
            apiUrl: config.API_URL
          });
    }

    
    categoryService.getCategoriesWithChilds(db).then(
      (data) => {
          db.Blog.findById(id).then(
            (blog) => {
                res.render('blogs/details', {
                    parentCategories: data.parentCategories || [],
                    categoriesViewInMenu: data.parentCategories.filter(x => x.viewInMenu) || [],
                    apiUrl: config.API_URL,
                    blog: blog
                });
            }
          ).catch(
              (err) => {
                  console.log(err);
                  res.render('blogs/details', { 
                    title: 'Express123',
                    parentCategories: [],
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
        res.render('blogs/details', { 
          title: 'Express123',
          categories: [],
          errors: err,
          apiUrl: config.API_URL
        });
      }
    );
  });

  app.use('/blogs', router);
};
