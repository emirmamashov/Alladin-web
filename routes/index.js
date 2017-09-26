let express = require('express');
let router = express.Router();

let categoryService = require('../services/category');
let chunkService = require('../services/chunk');

module.exports = (app, db) => {
    let config = app.get('config');
    /* GET home page. */
    router.get('/', (req, res) => {
        db.Category.find({ parentCategory: null }).limit(20).then(
            (parentCategories) => {
                let chunkCategories = chunkService(parentCategories.filter(x => x.image), 4);
                let categoriesLeft = parentCategories.filter(x => x.showInMainPageLeft);
                let categoriesRight = parentCategories.filter(x => x.showInMainPageRight);

                let parentCategoryIds = [];
                parentCategories.forEach((parentCategory) => {
                    parentCategoryIds.push(parentCategory.id);
                });

                db.Category.find({ parentCategory: { $in: parentCategoryIds } }).then(
                    (childCategories) => {
                        let childCategoryIds = [];
                        parentCategories.forEach((parentCategory) => {
                            parentCategory['childCategories'] = childCategories.filter(x => x.parentCategory == parentCategory.id) || [];
                        });

                        childCategories.forEach((childCategory) => {
                            childCategoryIds.push(childCategory.id);
                        });

                        db.Category.find({ parentCategory: { $in: childCategoryIds } }).then(
                            (secondCategories) => {
                                childCategories.forEach((parentCategory) => {
                                    childCategories['childCategories'] = secondCategories.filter(x => x.parentCategory == parentCategory.id) || [];
                                });

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
                                                                                    parentCategories: parentCategories,
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
                                            parentCategories: categoryService.findParentCategory(categories),
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

    router.get('/confirm', (req, res) => {
        res.render('confirm');
    });

    router.get('/landing', (req, res) => {
        res.render('landing');
    });

    app.use('/', router);
};
