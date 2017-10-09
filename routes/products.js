let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let ObjectId = mongoose.Types.ObjectId;

// services
let categoryService = require('../services/category');
let chunkService = require('../services/chunk');
let productService = require('../services/product');

module.exports = (app, db) => {
    let config = app.get('config');
    router.get('/', (req, res) => {
        categoryService.getCategoriesWithChilds(db).then(
            (data) => {
                let parentCategories = data.parentCategories;
                parentCategories.forEach((parentCategory) => {
                    parentCategory['apiUrl'] = config.API_URL;
                });
                res.render('products/index', {
                    title: 'Products',
                    categories: parentCategories
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

        db.Category.findById(categoryId).then(
            (category) => {
                db.Category.find({ level: category.level }).then(
                    (categories) => {
                        categories.forEach((category) => {
                          if (category) {
                            category['apiUrl'] = config.API_URL;
                            /*productService.getCountProductsByCategoryId(db, categories, category).then(
                                (count) => {
                                }
                            );*/
                          }
                        });
                        let currentCategory = categories.filter(x => x.id == category.id)[0] || {};
                        currentCategory['selected'] = true;

                        let categoryIds = [];
                        categoryIds.push(category.id);
            
                        db.Product.find({ categoryId: { $in: categoryIds } }).then(
                            (products) => {
                                products.forEach((product) => {
                                    if (product) {
                                        product['apiUrl'] = config.API_URL;
                                    }
                                });
                                categoryService.getCategoriesWithChilds(db).then(
                                    (data) => {
                                        res.render('products/index', {
                                            title: 'Products',
                                            products: products,
                                            parentCategories: data.parentCategories,
                                            categories: categories,
                                            category: currentCategory
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
                    }
                ).catch(
                    (err) => {
                        console.log(err);
                        res.render('products/index', {
                            title: 'Products',
                            products: [],
                            errors: err,
                        });
                    }
                );
            }
        ).catch(
            (err) => {
                console.log(err);
                res.render('products/index', {
                    title: 'Products',
                    products: [],
                    errors: err,
                });
            }
        );
    });

    router.get('/details/:id', (req, res) => {
        let id = req.params.id;
        categoryService.getCategoriesWithChilds(db).then(
            (data) => {
                db.Product.findById(req.params.id).then(
                    (product) => {
                        product['apiUrl'] = config.API_URL;
                        let images = [];
                        if (product.images && product.images.length > 0) {
                            product.images.forEach((image) => {
                                images.push({
                                    apiUrl: config.API_URL,
                                    image: image
                                });
                            });
                        }
                        console.log(product);
                        db.Exchange.findOne().then(
                            (exchange) => {
                                if (exchange && exchange.usd) {
                                    if (product.price) product.price = (parseFloat(product.price) * parseFloat(exchange.usd)).toFixed(2);
                                    if (product.priceTrad) product.priceTrade = (parseFloat(product.priceTrade) * parseFloat(exchange.usd)).toFixed(2);
                                    if (product.priceStock) product.priceStock = (parseFloat(product.priceStock) * parseFloat(exchange.usd)).toFixed(2);
                                    /*if (product.price && product.priceStock &&
                                        product.price > 0 && product.priceStock > 0) {
                                        let differencePercent = (product.priceStock / product.price) * 100; // процент от числа
                                        product['percent'] = Math.round(100 - differencePercent);
                                    }*/
                                }
                                
                                res.render('products/details', { 
                                    title: 'details', 
                                    product: product,
                                    parentCategories: data.parentCategories,
                                    images: images.filter(x => x.image != product.image)
                                });
                            }
                        ).catch(
                            (err) => {
                                console.log(err);
                                res.render('products/details', {
                                    title: 'Products',
                                    errors: err
                                });
                            }
                        );
                    }
                ).catch(
                    (err) => {
                        res.render('products/details', {
                            title: 'Products',
                            errors: err
                        });
                        // res.redirect('/products');
                    }
                );
            }
        ).catch(
            (err) => {
                console.log(err);
                res.render('products/details', {
                    title: 'Products',
                    errors: err
                });
            }
        );
    });

    router.post('/search', (req, res) => {
        let regex = new RegExp(req.body.text, 'i');
        console.dir(req.body);
        categoryService.getCategoriesWithChilds(db).then(
        (data) => {
            db.Product.find({ name: regex }).then(
                (products) => {
                    res.render('products/index', {
                        title: 'Products',
                        products: products,
                        parentCategories: data.parentCategories
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
        }).catch(
                (err) => {
                    console.log(err);
                    res.render('products/index', {
                        title: 'Products',
                        products: [],
                        errors: err
                });
            })
        
    });

    router.get('/countByCategoryId/:id', (req, res) => {
        let categoryId = req.params.id;
        if (!categoryId || !ObjectId.isValid(categoryId)) {
            return res.status(200).json({
                success: false,
                code: 404
            });
        }
        productService.getCountProductsByCategoryId(db, categoryId).then(
            (count) => {
                console.log(count);
                return res.status(200).json({
                    success: true,
                    code: 200,
                    data: count
                });
            }
        ).catch(
            (err) => {
                console.log(err);
                return res.status(200).json({
                    success: false,
                    code: 500
                });
            }
        );
    });

    app.use('/products', router);
}