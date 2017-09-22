// services
let categoryService = require('../services/category');

module.exports = {
    getCountProductsByCategoryId(db, categories, category) {
        if (!db || !category) {
            console.log('parameters not valid');
            // return resolve();
        }
        let categoryIds = [];
        let childsCategories = categoryService.findChildCategories(categories, [category], []);
        if (childsCategories && childsCategories.length > 0) {
            childsCategories.forEach((childCategory) => {
                categoryIds.push(childCategory.id);
            });
        }
        console.log(categoryIds);
        db.Product.count({ categoryId: {$in: categoryIds} }).then(
            (count) => {
                category['productsCount'] = count;
            }
        ).catch(
            (err) => {
                console.log(err);
                // resolve();
            }
        );
    }
}