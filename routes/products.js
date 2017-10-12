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
                    categories: parentCategories,
                    categoriesViewInMenu: parentCategories.filter(x => x.viewInMenu)
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

    router.get('/category/:categoryName/:id/:parentCategoryId', (req, res) => {
        let categoryId = req.params.id;
        let parentCategoryId = req.params.parentCategoryId;
        if (!categoryId || !ObjectId.isValid(categoryId)) {
            return res.render('products/index', {
                title: 'Products',
                products: [],
                errors: 'параметр неправильно передано'
            });
        }

        db.Category.findById(categoryId).then(
            (category) => {
                db.Category.find({ level: category.level, parentCategory: parentCategoryId }).then(
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
                        db.Exchange.findOne().then(
                            (exchange) => {
                                db.Product.count({ categoryId: { $in: categoryIds } }).then(
                                    (count) => {
                                        console.log(count);
                                        let page = parseInt(req.query.page) || 1;
                                        let limit = parseInt(req.query.limit) || 30;
                                        console.log(page, limit);
                                        db.Product.paginate({ categoryId: { $in: categoryIds } }, { page: page, limit: limit }, (err, result) => {
                                            if (err) {
                                                console.log(err);
                                                return (err) => {
                                                    console.log(err);
                                                    res.render('products/index', {
                                                        title: 'Products',
                                                        products: [],
                                                        errors: err
                                                    });
                                                }
                                            }
                                            let products = result.docs;
                                            products.forEach((product) => {
                                                if (product) {
                                                    product['apiUrl'] = config.API_URL;
                                                }

                                                if (exchange && exchange.usd) {
                                                    let price = parseFloat(product.price) || 0;
                                                    let priceTrade = parseFloat(product.priceTrade) || 0;
                                                    let priceStock = parseFloat(product.priceStock) || 0;
                                                    product.price = (price * exchange.usd).toFixed(2);
                                                    product.priceTrade = (priceTrade * exchange.usd).toFixed(2);
                                                    product.priceStock = (priceStock * exchange.usd).toFixed(2);
                                                }
                                            });
                                            let pageCount = Math.ceil(count / limit);
                                            let pages = [];
                                            for (let i = 1; i <= pageCount; i++) {
                                                if (pageCount === page) {
                                                    pages.push({
                                                        selected: true,
                                                        page: i
                                                    });
                                                } else {
                                                    pages.push({
                                                        selected: false,
                                                        page: i
                                                    });
                                                }
                                            }
                                            categoryService.getCategoriesWithChilds(db).then(
                                                (data) => {
                                                    res.render('products/index', {
                                                        title: 'Products',
                                                        products: products,
                                                        parentCategories: data.parentCategories,
                                                        categoriesViewInMenu: data.parentCategories.filter(x => x.viewInMenu),
                                                        categories: categories,
                                                        category: currentCategory,
                                                        pages: pages
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
                                    }
                                ).catch(
                                    (err) => {
                                        console.log(err);
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
                                    if (product.priceTrade) product.priceTrade = (parseFloat(product.priceTrade) * parseFloat(exchange.usd)).toFixed(2);
                                    if (product.priceStock) product.priceStock = (parseFloat(product.priceStock) * parseFloat(exchange.usd)).toFixed(2);
                                    if (product.price && product.priceStock) product['economPrice'] = (product.price - product.priceStock).toFixed(2);
                                }

                                let name = product.name.split(' ')[0];
                                let regexProductName = new RegExp(name, 'i');
                                db.Product.find({
                                    _id: {
                                        $nin: product.id
                                    },
                                    name: regexProductName,
                                    parentCategory: product.parentCategory
                                }).limit(30).then(
                                    (relatedProducts) => {
                                        relatedProducts.forEach((product) => {
                                            product['apiUrl'] = config.API_URL;
                                        });

                                        res.render('products/details', {
                                            title: 'details',
                                            product: product,
                                            parentCategories: data.parentCategories,
                                            categoriesViewInMenu: data.parentCategories.filter(x => x.viewInMenu),
                                            images: images.filter(x => x.image != product.image),
                                            relatedProducts: relatedProducts
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
                        parentCategories: data.parentCategories,
                        categoriesViewInMenu: data.parentCategories.filter(x => x.viewInMenu),
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