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
        categoryService.getCategoriesWithChilds(db).then(
            (categories) => {
                res.render('categories/index', {
                    title: 'Categories',
                    parentCategories: data.parentCategories,
                    categories: data.categories,
                    chunkCategories: chunk(data.childCategories, 3)
                });
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
        if (!categoryId || !ObjectId.isValid(categoryId)) {
            console.log('error in parameters');
            return res.render('categories/index', {
                title: 'Categories', errors: 'error in parameters'
            });
        }

        db.Category.findById(categoryId).then(
            (category) => {
                categoryService.getChildCategoriesByCategoryId(db, [categoryId]).then(
                    (resultCategories) => {
                        let categories = categoryService.findChildCategoriesForParent(resultCategories.parentCategories, resultCategories.categories);
                        categoryService.getCategoriesWithChilds(db).then(
                            (data) => {
        
                                let selectedCategory = categories[0];
                                res.render('categories/index', {
                                    title: 'Categories',
                                    categories: categories,
                                    parentCategories: data.parentCategories || [],
                                    selectedCategory: selectedCategory,
                                    chunkCategories: chunk(resultCategories.parentCategories || [], 3)
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