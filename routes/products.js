let express = require('express');
let router = express.Router();

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