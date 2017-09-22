let express = require('express');
let router = express.Router();

let categoryService = require('../services/category');
let chunkService = require('../services/chunk');

module.exports = (app, db) => {
    let config = app.get('config');
    /* GET home page. */
    router.get('/', (req, res) => {
        db.Category.find().then(
            (categories) => {
                db.Product.find().then(
                    (products) => {
                        let categoryIds = [];
                        let photoIds = [];

                        db.Exchange.findOne().then(
                            (exchange) => {
                                console.log(exchange);
                                products.forEach((product) => {
                                    product['apiUrl'] = config.API_URL;
                                    if (exchange && exchange.usd) {
                                        let price = parseFloat(product.price) || 0;
                                        let priceTrade = parseFloat(product.priceTrade) || 0;
                                        let priceStock = parseFloat(product.priceStock) || 0;
                                        product.price = (price * exchange.usd).toFixed(2);
                                        product.priceTrade = (priceTrade * exchange.usd).toFixed(2);
                                        product.priceStock = (priceStock * exchange.usd).toFixed(2);
                                    }
                                });

                                categories.forEach((category) => {
                                    if (category) {
                                        category['apiUrl'] = config.API_URL;
                                        categoryIds.push(category._id);
                                    }
                                });

                                let parentCategories = categoryService.findParentCategory(categories, products);

                                db.Banner.find().then(
                                    (banners) => {
                                        banners.forEach((banner) => {
                                            banner['apiUrl'] = config.API_URL;
                                        });

                                        db.Producer.find().then(
                                            (producers) => {
                                                producers.forEach((producer) => {
                                                    producer['apiUrl'] = config.API_URL;
                                                });

                                                let categoryIds = [];
                                                let categoriesViewInLikesBlock = categories.filter(x => x.viewInLikeBlock) || [];
                                                categoriesViewInLikesBlock.forEach((category) => {
                                                    categoryIds.push(category._id);
                                                });

                                                db.Product.find().limit(30).then(
                                                    (rndProducts) => {
                                                        console.log(rndProducts);
                                                        rndProducts.forEach((product) => {
                                                            product['apiUrl'] = config.API_URL;
                                                            if (exchange && exchange.usd) {
                                                                let price = parseFloat(product.price) || 0;
                                                                let priceTrade = parseFloat(product.priceTrade) || 0;
                                                                let priceStock = parseFloat(product.priceStock) || 0;
                                                                product.price = (price * exchange.usd).toFixed(2);
                                                                product.priceTrade = (priceTrade * exchange.usd).toFixed(2);
                                                                product.priceStock = (priceStock * exchange.usd).toFixed(2);
                                                            }
                                                        });
                                                        categoriesViewInLikesBlock.forEach((category) => {
                                                            category['rndProducts'] = rndProducts.filter(x => x.categoryId && x.categoryId.toString() === category._id.toString());
                                                        });

                                                        let hotProducts = products.filter(x => x.isHot);
                                                        for (let i = 0; i < hotProducts.length > 0; i++) {
                                                            hotProducts[i]['apiUrl'] = config.API_URL;
                                                            if (hotProducts[i].price && hotProducts[i].priceStock &&
                                                                hotProducts[i].price > 0 && hotProducts[i].priceStock > 0) {
                                                                let differencePercent = (hotProducts[i].priceStock / hotProducts[i].price) * 100; // процент от числа
                                                                hotProducts[i]['percent'] = Math.round(100 - differencePercent);
                                                            }
                                                            /*if (exchange && exchange.usd) {
                                                              let price = parseFloat(hotProducts[i].price) || 0;
                                                              let priceTrade = parseFloat(hotProducts[i].priceTrade) || 0;
                                                              let priceStock = parseFloat(hotProducts[i].priceStock) || 0;
                                                              hotProducts[i].price = price * exchange.usd;
                                                              hotProducts[i].priceTrade = priceTrade * exchange.usd;
                                                              hotProducts[i].priceStock = priceStock * exchange.usd;
                                                            }*/
                                                        }
                                                        let leftBannerShowInMainPage = banners.filter(x => x.showInMainPageLeft)[0];
                                                        let rigthBannerShowInMainPage = banners.filter(x => x.showInMainPageRight)[0];

                                                        let chunkProducers = chunkService(producers, 5);
                                                        let producersLeft = {};
                                                        let producersRight = {};
                                                        if (chunkProducers[0] && chunkProducers[0].data) producersLeft = chunkProducers[0].data;
                                                        if (chunkProducers[1] && chunkProducers[1].data) producersRight = chunkProducers[1].data;

                                                        let chunkCategories = chunkService(categories.filter(x => x.image), 4);

                                                        let categoriesLeft = categories.filter(x => x.showInMainPageLeft);
                                                        let categoriesRight = categories.filter(x => x.showInMainPageRight);

                                                        res.render('index', {
                                                            title: 'Главная страница',
                                                            parentCategories: parentCategories,
                                                            products: products,
                                                            categoriesViewInMenu: parentCategories.filter(x => x.viewInMenu),
                                                            apiUrl: config.API_URL,
                                                            banners: banners,
                                                            leftBannerShowInMainPage: leftBannerShowInMainPage,
                                                            rigthBannerShowInMainPage: rigthBannerShowInMainPage,
                                                            producers: producers,
                                                            producersLeft: producersLeft,
                                                            producersRight: producersRight,
                                                            categoriesViewInLikesBlock: categoriesViewInLikesBlock,
                                                            categoriesLeft: categoriesLeft,
                                                            categoriesRight: categoriesRight,
                                                            rndProducts: rndProducts,
                                                            hotProducts: hotProducts
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

    router.get('/advices', (req, res) => {
        res.render('advices');
    });

    router.get('/advice', (req, res) => {
        res.render('advice');
    });

    router.get('/services', (req, res) => {
        res.render('services');
    });

    app.use('/', router);
};
