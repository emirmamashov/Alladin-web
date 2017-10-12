window.onload = init();
function init() {
    // viewedProductDetails();
    setTotalPrice();
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

function setTotalPrice() {
    let count = $('#total-amount').val();
    let price = $('#price').val();
    $('#totalPrice')[0].textContent = parseFloat(price) * parseFloat(count) + ' сом';
}

function plusProduct(price) {
    let totalPriceNumber = $('#totalPrice')[0].textContent;
    let totalPrice = parseFloat(totalPriceNumber) + parseFloat(price);
    $('#totalPrice')[0].textContent = totalPrice + ' сом';
}
function minusProduct(price) {
    let totalPriceNumber = parseFloat($('#totalPrice')[0].textContent);
    if (totalPriceNumber > price) {
        let totalPrice = totalPriceNumber - parseFloat(price);
        $('#totalPrice')[0].textContent = totalPrice + ' сом';
    }
}