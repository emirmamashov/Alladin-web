function productToBucket(productId) {
    console.log(productId);
    let productIdsInLocalStorage = window.localStorage.getItem('inBucket') || '';
    let productsInBucket = productIdsInLocalStorage.split(',') || [];

    const productElem = document.getElementById('buttonInBucket_' + productId);
    if (productElem) {
        productElem.innerHTML = '<span class="icon icon-buy"></span>Добавлено'
    }
    if (productsInBucket.filter(x => x === productId).length > 0) {
        const productElem = document.getElementById('buttonInBucket_' + productId);
        if (productElem) {
            console.dir(productElem);
            productElem.innerHTML = '<span class="icon icon-buy"></span>В корзину'
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

function checkProductsInBucket() {
    console.log('checkProductsInBucket');
    let productIdsInLocalStorage = window.localStorage.getItem('inBucket') || '';
    let productsInBucket = productIdsInLocalStorage.split(',') || [];

    if (!productsInBucket || productsInBucket.length === 0) {
        return console.log('корзина пуст');
    }
    productsInBucket.forEach((id) => {
        const productElem = document.getElementById('buttonInBucket_' + id);
        console.dir(productElem);
        if (productElem) {
            console.dir(productElem);
            productElem.innerHTML = '<span class="icon icon-buy"></span>Добавлено'
        }
    });
}

$(document).ready(function () {
    console.log('ready');
    checkProductsInBucket();
});