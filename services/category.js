let categoryIds = [];
let config = require('../config')['development'];
module.exports = {
    findChildCategoriesForParent(parentCategories, categories) {
        if (!parentCategories || parentCategories.length < 1) {
            return [];
        }
        parentCategories.forEach((category) => {
            category['childCategories'] = categories.filter(x => x.parentCategory && x.parentCategory.toString() === category._id.toString()) || [];
            this.findChildCategories(categories, category['childCategories']);
        });
        // console.log(parentCategories);
        return parentCategories;
    },
    findChildCategories(allCategories, categories) {
        if (!categories || categories.length === 0 || !allCategories || allCategories.length === 0) {
            return [];
        }
        categories.forEach((category) => {
            category['childCategories'] = allCategories.filter(x => x.parentCategory && x.parentCategory.toString() === category._id.toString()) || [];
            this.findChildCategories(categories, category['childCategories']);
        });
    },

    findProductsForCategories(categories, products) {
        if (!categories || categories.length === 0 || !products || products.length === 0) {
            return [];
        }
        categories.forEach((category) => {
            category['products'] = products.filter(x => x.categoryId.toString() === category._id.toString()) || [];
        });

        return categories;
    },
    getAllChildrenCategoriesId(db, parentCategoryIds) {
        return new Promise((resolve, reject) => {
            db.Category.find({ parentCategory: { $in: parentCategoryIds } }).then(
                (childCategories) => {
                    if (!childCategories || childCategories.length < 1) {
                        return resolve(categoryIds);
                    }
                    let newParentCategoryIds = [];
                    childCategories.forEach((childCategory) => {
                        categoryIds.push(childCategory.id);
                        newParentCategoryIds.push(childCategory.id);
                    });
                    return this.getAllChildrenCategoriesId(db, newParentCategoryIds, categoryIds);
                }
            ).catch(
                (err) => {
                    console.log(err);
                    resolve(categoryIds);
                }
            );
        });
    },
    getCategoriesWithChilds(db) {
        return new Promise((resolve, reject) => {
            db.Category.find({ parentCategory: null }).limit(20).then(
                (parentCategories) => {
                    if (!parentCategories || parentCategories.length < 1) {
                        return resolve();
                    }

                    let parentCategoryIds = [];
                    parentCategories.forEach((parentCategory) => {
                        parentCategoryIds.push(parentCategory.id);
                    });
    
                    db.Category.find({ parentCategory: { $in: parentCategoryIds } }).then(
                        (childCategories) => {
                            if (!childCategories || childCategories.length < 1) {
                                return resolve({
                                    parentCategories: parentCategories,
                                    childCategories: [],
                                    secondCategories: []
                                });
                            }
                            let childCategoryIds = [];
                            parentCategories.forEach((parentCategory) => {
                                parentCategory['childCategories'] = childCategories.filter(x => x.parentCategory == parentCategory.id) || [];
                                parentCategory['apiUrl'] = config.API_URL;
                            });
    
                            childCategories.forEach((childCategory) => {
                                childCategoryIds.push(childCategory.id);
                                childCategory['apiUrl'] = config.API_URL;
                            });
    
                            db.Category.find({ parentCategory: { $in: childCategoryIds } }).then(
                                (secondCategories) => {
                                    if (!secondCategories || secondCategories.length < 1) {
                                        return resolve({
                                            parentCategories: parentCategories,
                                            childCategories: childCategories,
                                            secondCategories: []
                                        });
                                    }
                                    childCategories.forEach((parentCategory) => {
                                        parentCategory['childCategories'] = secondCategories.filter(x => x.parentCategory == parentCategory.id) || [];
                                    });

                                    resolve({
                                        parentCategories: parentCategories,
                                        childCategories: childCategories,
                                        secondCategories: secondCategories
                                    });
                                }
                            ).catch(
                                (err) => {
                                    console.log(err);
                                    resolve({
                                        parentCategories: parentCategories,
                                        childCategories: childCategories
                                    });
                                }
                            );
                        }
                    ).catch(
                        (err) => {
                            console.log(err);
                            resolve({
                                parentCategories: parentCategories
                            });
                        }
                    );
                }
            ).catch(
                (err) => {
                    console.log(err);
                    resolve();
                }
            );
        });
    },
    getChildCategoriesByCategoryId(db, parentCategoryIds, resultCategories) {
        return new Promise((resolve, reject) => {
            if (!db || !parentCategoryIds || parentCategoryIds.length < 1) {
                return resolve();
            }
            db.Category.find({ parentCategory: { $in: parentCategoryIds} }).then(
                (categories) => {
                    let categoryIds = [];
                    if (categories.length < 1) {
                        return resolve(resultCategories);
                    }

                    categories.forEach((category) => {
                        categoryIds.push(category.id);
                    });
                    if (!resultCategories) {
                        resultCategories = {
                            parentCategories: categories,
                            categories: categories
                        };
                        return resolve(this.getChildCategoriesByCategoryId(db, categoryIds, resultCategories));
                    }
                    resultCategories.categories = resultCategories.categories.concat(categories);
                    return resolve(this.getChildCategoriesByCategoryId(db, categoryIds, resultCategories));
                }
            ).catch(
                (err) => {
                    console.log(err);
                    resolve(resultCategories);
                }
            );
        });
    }
}