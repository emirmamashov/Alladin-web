let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let ObjectId = mongoose.Types.ObjectId;

// services
let categoryService = require('../services/category');
let chunk = require('../services/chunk');

module.exports = (app, db) => {
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
                            parentCategories: parentCategories,
                            products: products,
                            chunkCategories: chunk(parentCategories)
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
                db.Product.find().then(
                    (products) => {
                        let parentCategories = categoryService.findParentCategory(categories, products);
                        let selectedCategory = categories.filter(x => x._id == categoryId)[0];
                        let selectedChildCategories = categoryService.findChildCategories(categories, selectedCategory.childCategories, products);
                        selectedCategory['selected'] = true;
                        console.log(selectedChildCategories);
                        return res.render('categories/index', { 
                            title: 'Categories', 
                            parentCategories: parentCategories,
                            products: products,
                            selectedCategory: selectedCategory,
                            chunkCategories: chunk(selectedChildCategories)
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