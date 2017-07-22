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
            let bannerIds = [];
            let photoIds = [];

            categories.forEach((category) => {
              if (category.banner) {
                bannerIds.push(category.banner);
              }
              if (category.photo) {
                photoIds.push(category.photo);
              }
            });

            db.Banner.find({ _id: {$in: bannerIds} }).then(
              (banners) => {
                banners.forEach((banner) => {
                  if (banner.photo) {
                    photoIds.push(banner.photo);
                  }
                });

                db.Photo.find({ _id: { $in: photoIds } }).then(
                  (photos) => {
                    banners.forEach((banner) => {
                        let bannerPhotoIdString = banner.photo ? banner.photo.toString() : '';
                        banner.photo = photos.filter(x => x._id.toString() === bannerPhotoIdString)[0] || {};
                        banner['apiUrl'] = config.API_URL;
                    });

                    categories.forEach((category) => {
                        let categoryPhotoIdString = category.photo ? category.photo.toString() : '';
                        let categoryBannerIdString = category.banner ? category.banner.toString() : '';
                        category.photo = photos.filter(x => x._id.toString() === categoryPhotoIdString)[0] || {};
                        category.banner = banners.filter(x => x._id.toString() === categoryBannerIdString)[0] || {};
                        category['apiUrl'] = config.API_URL;
                    });

                    res.render('index', { 
                      title: 'Express123',
                      parentCategories: categoryService.findParentCategory(categories, products),
                      products: products,
                      categoriesViewInMenu: categories.filter(x => x.viewInMenu),
                      apiUrl: config.API_URL,
                      banners: banners
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
