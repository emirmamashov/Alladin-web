let express = require('express');
let router = express.Router();

// services
let categoryService = require('../services/category');

module.exports = (app, db) => {
    router.get('/', (req, res) => {
        db.Category.find().then(
            (categories) => {
                res.render('categories/index', { title: 'Categories', categories: categories });
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