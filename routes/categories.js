let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let ObjectId = mongoose.Types.ObjectId;

// services
let categoryService = require('../services/category');
let productService = require('../services/product');
let chunk = require('../services/chunk');

module.exports = (app, db) => {
    let config = app.get('config');
    router.get('/', (req, res) => {
        console.log('----------categories---------');
        db.Category.find().then(
            (categories) => {
                db.Product.find().then(
                    (products) => {
                        let parentCategories = categoryService.findParentCategory(categories, products);
                        console.log(parentCategories);
                        res.render('categories/index', { 
                            title: 'Categories', 
                            parentCategories: parentCategories.slice(0, config.CountViewsCategoriesInMainPage),
                            products: products,
                            chunkCategories: chunk(parentCategories, 3)
                        });
                    }
                ).catch(
                    (err) => {
                        console.log(err);
                        res.render('categories/index', { title: 'Categories', errors: err });
                    }
                );
            }
        ).catch(
            (err) => {
                console.log(err);
                res.render('categories/index', { title: 'Categories', errors: err });
            }
        );
    });

    router.get('/:name/:id', (req, res) => {
        console.log('---------/:name/:id------------');
        let categoryId = req.params.id;
        console.log(categoryId);
        if (!categoryId || !ObjectId.isValid(categoryId)) {
            console.log('error in parameters');
            return res.render('categories/index', { title: 'Categories', errors: 'error in parameters' });
        }
        db.Category.find().then(
            (categories) => {
                /*categories.forEach((category) => {
                    if (category) {
                      category['apiUrl'] = config.API_URL;
                      productService.getCountProductsByCategoryId(db, categories, category);
                    }
                  });*/
                db.Product.find().then(
                    (products) => {
                        let parentCategories = categoryService.findParentCategory(categories, products);
                        parentCategories.forEach((category) => {
                            if (category) {
                              category['apiUrl'] = config.API_URL;
                              productService.getCountProductsByCategoryId(db, categories, category);
                            }
                        });
                        console.log(parentCategories.length);
                        let selectedCategory = categories.filter(x => x.id === categoryId)[0];
                        let selectedChildCategories = categoryService.findChildCategories(categories, selectedCategory.childCategories, products);
                        selectedCategory['selected'] = true;

                        return res.render('categories/index', { 
                            title: 'Categories', 
                            parentCategories: parentCategories,
                            products: products,
                            selectedCategory: selectedCategory,
                            chunkCategories: chunk(selectedChildCategories, 3)
                        });
                    }
                ).catch(
                    (err) => {
                        console.log(err);
                        res.render('categories/index', { title: 'Categories', errors: err });
                    }
                );
            }
        ).catch(
            (err) => {
                console.log(err);
                res.render('categories/index', { title: 'Categories', errors: err });
            }
        );
    });

    app.use('/categories', router);
}