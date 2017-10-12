window.onload = init();
function init() {
    viewedProductDetails();
}

function viewedProductDetails() {
    let productId = $('#productId').val();
    if (!productId) {
        return console.log('productId is null');
    }
    LocalStorageService.setViewedProductIds(productId);
    ProductService.getViewedProducts(LocalStorageService.getViewedProductIds()).then(
        (result) => {
            // setViewedProductsInPage(result.data.data);
            console.log(result);
        }
    );
}