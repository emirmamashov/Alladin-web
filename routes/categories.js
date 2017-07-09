let express = require('express');
let router = express.Router();

// services
let categoryService = require('../services/category');
let chunk = require('../services/chunk');

module.exports = (app, db) => {
    router.get('/', (req, res) => {
        db.Category.find().then(
            (categories) => {
                db.Product.find().then(
                    (products) => {
                        let parentCategories = categoryService.findParentCategory(categories, products);
                        res.render('categories/index', { 
                            title: 'Categories', 
                            parentCategories: parentCategories,
                            products: products,
                            chunkParentCategories: chunk(parentCategories)
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