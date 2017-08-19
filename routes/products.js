let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let ObjectId = mongoose.Types.ObjectId;

module.exports = (app, db) => {
    router.get('/', (req, res) => {
        db.Product.find().then(
            (products) => {
                res.render('products/index', {
                    title: 'Products',
                    products: products
                });
            }
        ).catch(
            (err) => {
                console.log(err);
                res.render('products/index', {
                    title: 'Products',
                    products: [],
                    errors: err
                });
            }
        );
    });

    router.get('/category/:categoryName/:id', (req, res) => {
        let categoryId = req.params.id;
        if (!categoryId || !ObjectId.isValid(categoryId)) {
            return res.render('products/index', {
                title: 'Products',
                products: [],
                errors: 'параметр неправильно передано'
            });
        }
        db.Product.find({ categoryId: categoryId }).then(
            (products) => {
                res.render('products/index', {
                    title: 'Products',
                    products: products
                });
            }
        ).catch(
            (err) => {
                console.log(err);
                res.render('products/index', {
                    title: 'Products',
                    products: [],
                    errors: err
                });
            }
        );
    });

    router.get('/details/:id', (req, res) => {
        let id = req.params.id;
        db.Product.findById(req.params.id).then(
            (product) => {
                console.log(product.name);
                res.render('products/details', { 
                    title: 'details', 
                    product: product 
                });
            }
        ).catch(
            (err) => {
                res.redirect('/products');
            }
        );
    });

    router.post('/search', (req, res) => {
        let regex = new RegExp(req.body.text, 'i');
        console.dir(req.body);
        db.Product.find({ name: regex }).then(
            (products) => {
                res.render('products/index', {
                    title: 'Products',
                    products: products
                });
            }
        ).catch(
            (err) => {
                console.log(err);
                res.render('products/index', {
                    title: 'Products',
                    products: [],
                    errors: err
                });
            }
        );
    });

    app.use('/products', router);
}