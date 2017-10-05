let express = require('express');
let router = express.Router();

let categoryService = require('../services/category');
let chunkService = require('../services/chunk');

module.exports = (app, db) => {
    let config = app.get('config');
    /* GET home page. */
    router.get('/', (req, res) => {
        categoryService.getCategoriesWithChilds(db).then(
            (data) => {
                let parentCategories = data.parentCategories || [];
                let categoriesLeft = parentCategories.filter(x => x.showInMainPageLeft);
                let categoriesRight = parentCategories.filter(x => x.showInMainPageRight);

                db.Category.find({ viewInLikeBlock: true }).then(
                    (categoriesViewInLikesBlock) => {
                        db.Product.find({ isHot: true }).then(
                            (hotProducts) => {
                                db.Exchange.findOne().then(
                                    (exchange) => {
                                        for (let i = 0; i < hotProducts.length > 0; i++) {
                                            hotProducts[i]['apiUrl'] = config.API_URL;
                                            if (hotProducts[i].price && hotProducts[i].priceStock &&
                                                hotProducts[i].price > 0 && hotProducts[i].priceStock > 0) {
                                                let differencePercent = (hotProducts[i].priceStock / hotProducts[i].price) * 100; // процент от числа
                                                hotProducts[i]['percent'] = Math.round(100 - differencePercent);
                                            }
                                        }

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
        
                                                        db.Product.find().limit(30).then(
                                                            (rndProducts) => {
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
                                                                let leftBannerShowInMainPage = banners.filter(x => x.showInMainPageLeft)[0];
                                                                let rigthBannerShowInMainPage = banners.filter(x => x.showInMainPageRight)[0];
        
                                                                let chunkProducers = chunkService(producers, 5);
                                                                let producersLeft = {};
                                                                let producersRight = {};
                                                                if (chunkProducers[0] && chunkProducers[0].data) producersLeft = chunkProducers[0].data;
                                                                if (chunkProducers[1] && chunkProducers[1].data) producersRight = chunkProducers[1].data;
        
                                                                res.render('index', {
                                                                    title: 'Главная страница',
                                                                    parentCategories: data.parentCategories,
                                                                    categoriesViewInMenu: data.parentCategories.filter(x => x.viewInMenu),
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
                                                                    parentCategories: [],
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
                                                            parentCategories: [],
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
                                                    parentCategories: [],
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
                                            parentCategories: [],
                                            errors: err,
                                            apiUrl: config.API_URL
                                        });
                                    }
                                );
                            }
                        )
                    }
                ).catch(
                    (err) => {
                        console.log(err);
                        res.render('index', {
                            title: 'Express123',
                            parentCategories: [],
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
                    parentCategories: [],
                    errors: err
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

    router.get('/confirm', (req, res) => {
        res.render('confirm');
    });

    router.get('/landing', (req, res) => {
        res.render('landing');
    });

    app.use('/', router);
};
