module.exports = {
    findParentCategory(categories) {
        console.log(categories);
        if (categories && categories.length > 0) {
            let parentCategories = categories.filter(x => !x.parentCategory);
            parentCategories.forEach((category) => {
                category.childCategories = categories.filter(x => x.parentCategory && x.parentCategory.toString() === category._id.toString()) || [];
            });
            return parentCategories;
        }

        return [];
    }
}