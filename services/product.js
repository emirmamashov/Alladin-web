// services
let categoryService = require('../services/category');

module.exports = {
    getCountProductsByCategoryId(db, categories, category) {
        if (!db || !category) {
            console.log('parameters not valid');
            // return resolve();
        }
        let categoryIds = [];
        categoryIds.push(category.id);

        categoryService.findChildCategories(categories, [category], []);

        if (category && category.childCategories) {
            // console.log('category.childCategories = ' + category.childCategories.length);
            category.childCategories.forEach((childCategory) => {
                categoryIds.push(childCategory.id);
            });
        }

        db.Product.count({ categoryId: { $in: categoryIds } }).then(
            (count) => {
                // console.log(count);
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