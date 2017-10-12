let LocalStorageService = {};
LocalStorageService.getViewedProductIds = function() {
    return window.localStorage.getItem('viewProductDetails');
}
LocalStorageService.setViewedProductIds = function(productId) {
    let viewedProductIdsInLocalStorage = this.getViewedProductIds('viewProductDetails') || '';
    let viewedProductIdsInLocalStorageArr = viewedProductIdsInLocalStorage.split(',');

    viewedProductIdsInLocalStorage = ArrayOperationService.checkUnique(productId, viewedProductIdsInLocalStorageArr).join(',');

    window.localStorage.setItem('viewProductDetails', viewedProductIdsInLocalStorage);
    return true;
}