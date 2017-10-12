let ProductService = {};
ProductService.getViewedProducts = (id) => {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/products/api/getProductsByIds/',
            dataType: 'json',
            method: 'post',
            data: {
                id: id
            },
            async: true,
            // timeout: 5000E
        }).done(function(result) {
            console.log(result);
            resolve(result);
        })
        .fail(function(err) {
            console.log(err);
            reject(err);
        });
    });
}