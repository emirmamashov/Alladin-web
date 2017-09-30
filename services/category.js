let categoryIds = [];
module.exports = {
    findParentCategory(categories, products) {
        if (!categories || categories.length === 0) {
            return [];
        }
        let parentCategories = categories.filter(x => !x.parentCategory);
        products = products || [];
        parentCategories.forEach((category) => {
            let childCategories = categories.filter(x => x.parentCategory && x.parentCategory.toString() === category._id.toString()) || [];
            if (childCategories.length > 10) {
                childCategories = childCategories.slice(0, 10);
            }
            category['childCategories'] = childCategories;
            this.findChildCategories(categories, category['childCategories'], []);
            category['products'] = products.filter(x => x.categoryId && x.categoryId.toString() === category._id.toString()) || [];
        });
        // console.log(parentCategories);
        return parentCategories;
    },
    findChildCategories(allCategories, categories, products) {
        if (!categories || categories.length === 0 || !allCategories || allCategories.length === 0) {
            return [];
        }
        products = products || [];
        categories.forEach((category) => {
            category['childCategories'] = allCategories.filter(x => x.parentCategory && x.parentCategory.toString() === category._id.toString()) || [];
            category['products'] = products.filter(x => x.categoryId && x.categoryId.toString() === category._id.toString()) || [];
        });
        return categories;
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
    }
}