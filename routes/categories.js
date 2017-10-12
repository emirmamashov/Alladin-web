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
        categoryService.getCategoriesWithChilds(db).then(
            (categories) => {
                res.render('categories/index', {
                    title: 'Categories',
                    parentCategories: data.parentCategories,
                    categories: data.categories,
                    categoriesViewInMenu: data.parentCategories.filter(x => x.viewInMenu),
                    chunkCategories: chunk(data.childCategories, 3)
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
            return res.redirect('/categories');
        }

        db.Category.findById(categoryId).then(
            (category) => {
                if (!category) {
                    return res.redirect('/categories');
                    // res.render('categories/index', { title: 'Categories', errors: 'category not found' });
                }
                db.Category.findById(category.parentCategory).then(
                    (parentCategory) => {
                        db.Category.find({ level: category.level, parentCategory: category.parentCategory }).then(
                            (categories) => {
                                let categoryIds = [];
                                categories.forEach((category) => {
                                    categoryIds.push(category.id);
                                });
                                categoryService.getChildCategoriesByCategoryId(db, categoryIds).then(
                                    (resultCategories) => {
                                        categoryService.getCategoriesWithChilds(db).then(
                                            (data) => {
                                                categories.forEach((category) => {
                                                    category.childCategories = resultCategories.categories.filter(x => x.parentCategory == category.id);
                                                });
                                                let selectedCategory = categories.filter(x => x.id == categoryId)[0];
                                                if (selectedCategory) {
                                                    selectedCategory['selected'] = true;
                                                }
                                                res.render('categories/index', {
                                                    title: 'Categories',
                                                    categories: categories,
                                                    parentCategories: data.parentCategories || [],
                                                    categoriesViewInMenu: data.parentCategories.filter(x => x.viewInMenu),
                                                    selectedCategory: selectedCategory,
                                                    chunkCategories: chunk(selectedCategory.childCategories || [], 3),
                                                    parentCategory: parentCategory
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