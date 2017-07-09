module.exports = {
    findParentCategory(categories, products) {
        if (!categories || categories.length === 0) {
            return [];
        }
        let parentCategories = categories.filter(x => !x.parentCategory);
        parentCategories.forEach((category) => {
            category['childCategories'] = categories.filter(x => x.parentCategory && x.parentCategory.toString() === category._id.toString()) || [];
            category['products'] = products.filter(x => x.categoryId && x.categoryId.toString() === category._id.toString()) || [];
        });
        return parentCategories;
    },

    findProductsForCategories(categories, products) {
        if (!categories || categories.length === 0 || !products || products.length === 0) {
            return [];
        }
        categories.forEach((category) => {
            category['products'] = products.filter(x => x.categoryId.toString() === category._id.toString()) || [];
        });

        return categories;
    }
}