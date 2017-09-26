let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let ObjectId = mongoose.Types.ObjectId;

// services
let categoryService = require('../services/category');
let productService = require('../services/product');
let chunk = require('../services/chunk');

module.exports = (app, db) => {
    let config = app.get('config');

    router.get('/', (req, res) => {
        db.Category.find({ parentCategory:  null }).then(
            (categories) => {
                res.render('categories/index', {
                    title: 'Categories',
                    parentCategories: categories,
                    categories: categories,
                    chunkCategories: chunk(categories, 3)
                });
            }
        ).catch(
            (err) => {
                console.log(err);
                res.render('categories/index', { title: 'Categories', errors: err });
            }
        );
    });

    router.get('/:name/:id', (req, res) => {
        console.log('---------/:name/:id------------');
        let categoryId = req.params.id;
        if (!categoryId || !ObjectId.isValid(categoryId)) {
            console.log('error in parameters');
            return res.render('categories/index', {
                title: 'Categories', errors: 'error in parameters'
            });
        }

        db.Category.findById(categoryId).then(
            (category) => {
                if (!category) {
                    (err) => {
                        console.log(err);
                        res.render('categories/index', { title: 'Categories', errors: 'Категоря не найдено' });
                    }
                }
                
                db.Category.find({ level: category.level }).then(
                    (categories) => {
                        categories.forEach((category) => {
                            if (category) {
                              category['apiUrl'] = config.API_URL;
                              productService.getCountProductsByCategoryId(db, categories, category);
                            }
                        });
                        let selectedCategory = categories.filter(x => x.id === categoryId)[0];
                        selectedCategory['selected'] = true;
        
                        db.Category.find({ parentCategory: category.id }).then(
                            (childCategories) => {
                                categories.forEach((parentCategory) => {
                                    parentCategory['childCategories'] = childCategories.filter(x => x.parentCategory == parentCategory.id) || [];
                                });

                                let childCategoryIds = [];
                                childCategories.forEach((childCategory) => {
                                    childCategoryIds.push(childCategory.id);
                                });

                                db.Category.find({ parentCategory: { $in: childCategoryIds } }).then(
                                    (secondChildCategories) => {
                                        childCategories.forEach((childCategory) => {
                                            childCategory['childCategories'] = secondChildCategories.filter(x => x.parentCategory == childCategory.id) || [];
                                        });

                                        res.render('categories/index', {
                                            title: 'Categories',
                                            categories: categories,
                                            parentCategories: categories,
                                            selectedCategory: selectedCategory,
                                            chunkCategories: chunk(childCategories, 3)
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