function productToBucket(productId, page) {
    console.log(productId);
    let productIdsInLocalStorage = window.localStorage.getItem('inBucket') || '';
    let productsInBucket = productIdsInLocalStorage.split(',') || [];
    let buttonVal = '<span class="icon icon-buy"></span>:word';
    if (page === 'details') {
        buttonVal = '<span class="kolbox1_product">:word</span>';
    }
    const productElem = document.getElementById('buttonInBucket_' + productId);
    if (productElem) {
        productElem.innerHTML = buttonVal.replace(':word', 'Добавлено');
    }
    if (productsInBucket.filter(x => x && x === productId).length > 0) {
        const productElem = document.getElementById('buttonInBucket_' + productId);
        if (productElem) {
            console.dir(productElem);
            productElem.innerHTML = buttonVal.replace(':word', 'В корзину');
        }
        console.log('данный товар уже добавлено в корзину');
    }

    if (productsInBucket.filter(x => x === productId).length === 0) {
        productsInBucket.push(productId);
    } else {
        productsInBucket = productsInBucket.filter(x => x !== productId);
    }

    let stringProductIds = '';
    if (productsInBucket && productsInBucket.length > 0) {
        productsInBucket.forEach((id) => {
            if (id) {
                stringProductIds += id + ',';
            }
        });
    }
    window.localStorage.setItem('inBucket', stringProductIds);

}

function checkProductsInBucket(page) {
    console.log('checkProductsInBucket');
    let productIdsInLocalStorage = window.localStorage.getItem('inBucket') || '';
    let productsInBucket = productIdsInLocalStorage.split(',') || [];

    let buttonVal = '<span class="icon icon-buy"></span>:word';
    if (page === 'details') {
        buttonVal = '<span class="kolbox1_product">:word</span>';
    }

    if (!productsInBucket || productsInBucket.length === 0) {
        return console.log('корзина пуст');
    }
    productsInBucket.forEach((id) => {
        const productElem = document.getElementById('buttonInBucket_' + id);
        console.dir(productElem);
        if (productElem) {
            console.dir(productElem);
            productElem.innerHTML = buttonVal.replace(':word', 'Добавлено');
        }
    });
}

$(document).ready(function () {
    console.log('ready');
    const page = document.getElementById('page');
    checkProductsInBucket(page.value);
});