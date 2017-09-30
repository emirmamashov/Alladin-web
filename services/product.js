// services
let categoryService = require('../services/category');

module.exports = {
    getCountProductsByCategoryId(db, category) {
        return new Promise((resolve, reject) => {
            if (!db || !category) {
                console.log('parameters not valid');
                return resolve();
            }
            let parentCategoryIds = [];
            parentCategoryIds.push(category.id);
    
            categoryService.getAllChildrenCategoriesId(db, parentCategoryIds, []).then(
                (categoryIds) => {
                    if (!categoryIds || categoryIds.length < 1) {
                        return resolve();
                    }
                    return this.getCount(db, categoryIds, category);
                }
            ).catch(
                (err) => {
                    console.log(err);
                    resolve();
                }
            );
        });
    },
    getCount(db, categoryIds, category) {
        return new Promise((resolve, reject) => {
            db.Product.count({ categoryId: { $in: categoryIds } }).then(
                (count) => {
                    // console.log(count);
                    category['productsCount'] = count || 0;
                    resolve(count);
                }
            ).catch(
                (err) => {
                    // console.log(err);
                    resolve();
                }
            );
        });
    }
}