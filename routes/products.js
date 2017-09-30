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
        db.Category.find({ parentCategory: null }).limit(20).then(
            (parentCategories) => {
                let parentCategoryIds = [];
                parentCategories.forEach((parentCategory) => {
                    parentCategory['apiUrl'] = config.API_URL;
                    parentCategoryIds.push(parentCategory.id);
                });

                db.Category.find({ parentCategory: { $in: parentCategoryIds } }).then(
                    (childCategories) => {
                        let childCategoryIds = [];
                        childCategories.forEach((parentCategory) => {
                            parentCategory['apiUrl'] = config.API_URL;
                            childCategoryIds.push(parentCategory.id);
                        });

                        parentCategories.forEach((parentCategory) => {
                            parentCategory['childCategories'] = childCategories.filter(x => x.parentCategory == parentCategory.id);
                        });

                        db.Category.find({ parentCategory: { $in: childCategoryIds } }).then(
                            (secondCategories) => {

                                childCategories.forEach((parentCategory) => {
                                    parentCategory['childCategories'] = secondCategories.filter(x => x.parentCategory == parentCategory.id);
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
                            productService.getCountProductsByCategoryId(db, categories, category).then(
                                (count) => {
                                    // console.log(count);
                                }
                            );
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
                                db.Category.find({ parentCategory: null }).limit(20).then(
                                    (parentCategories) => {
                                        let parentCategoryIds = [];
                                        parentCategories.forEach((parentCategory) => {
                                            parentCategory['apiUrl'] = config.API_URL;
                                            parentCategoryIds.push(parentCategory.id);
                                        });
                        
                                        db.Category.find({ parentCategory: { $in: parentCategoryIds } }).then(
                                            (childCategories) => {
                                                let childCategoryIds = [];
                                                childCategories.forEach((parentCategory) => {
                                                    parentCategory['apiUrl'] = config.API_URL;
                                                    childCategoryIds.push(parentCategory.id);
                                                });
                        
                                                parentCategories.forEach((parentCategory) => {
                                                    parentCategory['childCategories'] = childCategories.filter(x => x.parentCategory == parentCategory.id);
                                                });
                        
                                                db.Category.find({ parentCategory: { $in: childCategoryIds } }).then(
                                                    (secondCategories) => {
                        
                                                        childCategories.forEach((parentCategory) => {
                                                            parentCategory['childCategories'] = secondCategories.filter(x => x.parentCategory == parentCategory.id);
                                                        });

                                                        res.render('products/index', {
                                                            title: 'Products',
                                                            products: products,
                                                            parentCategories: parentCategories,
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
        ).catch();
    });

    router.get('/details/:id', (req, res) => {
        let id = req.params.id;
        db.Category.find().then(
            (categories) => {
                let categoryIds = [];
                let photoIds = [];
    
                categories.forEach((category) => {
                  if (category) {
                    category['apiUrl'] = config.API_URL;
                    categoryIds.push(category._id);
                  }
                });

                db.Product.findById(req.params.id).then(
                    (product) => {
                        let parentCategories = categoryService.findParentCategory(categories, []);
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
                        res.render('products/details', { 
                            title: 'details', 
                            product: product,
                            parentCategories: parentCategories.slice(0, config.CountViewsCategoriesInMainPage),
                            images: images
                        });
                    }
                ).catch(
                    (err) => {
                        res.render('products/details', {
                            title: 'Products',
                            products: [],
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
                    products: [],
                    errors: err
                });

                //res.redirect('/products');
            }
        );
    });

    router.post('/search', (req, res) => {
        let regex = new RegExp(req.body.text, 'i');
        console.dir(req.body);
        db.Category.find().then(
            (categories) => {
                let categoryIds = [];
                let photoIds = [];
    
                categories.forEach((category) => {
                  if (category) {
                    category['apiUrl'] = config.API_URL;
                    categoryIds.push(category._id);
                  }
                });
                db.Product.find({ name: regex }).then(
                    (products) => {
                        let parentCategories = categoryService.findParentCategory(categories, products);
                        console.log(products);
                        res.render('products/index', {
                            title: 'Products',
                            products: products,
                            parentCategories: parentCategories.slice(0, config.CountViewsCategoriesInMainPage)
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
                }
            )
        
    });

    app.use('/products', router);
}