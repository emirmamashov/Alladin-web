window.onload = getCategoryIds();
function getCategoryIds() {
    let categoryIds = $('.categoryIds');
    if (!categoryIds || categoryIds.length < 1) {
        return console.log('categoryIds not found');
    }
    // let chunkCategoryIds = chunk(categoryIds, 100);
    // sendRequestChunk(chunk(categoryIds, 5));
    getCountProductsByCategoryId(categoryIds[0].value);
}

function sendRequestChunk(chunkCategoryIds) {
    let getCountProductsByCategoryIdPromises = [];
    for (let i = 0; i < chunkCategoryIds[0].data.length; i++) {
        getCountProductsByCategoryIdPromises.push(getCountProductsByCategoryId(chunkCategoryIds[0].data[i].value));
    }
    Promise.all(getCountProductsByCategoryIdPromises).then(
        (result) => {
            console.log(result);
            // return sendRequestChunk(chunkCategoryIds.slice(0, chunkCategoryIds.length));
        }
    ).catch(
        (err) => {
            console.log(err);
        }
    );
}
function getCountProductsByCategoryId(categoryId) {
    return new Promise((resolve, reject) => {
        if (!categoryId) {
            console.log('categoryId is null');
            resolve();
       }
   
       $.ajax({
           url: '/products/countByCategoryId/' + categoryId,
           // dataType: 'json',
           method: 'get',
           // async: true,
           // timeout: 5000E
       }).done(function(result) {
           console.log(result);
           if (!result || !result.success) {
               return console.log('error in request');
           }
           setCountInElem(categoryId, result.data);
           resolve(result.data);
         })
         .fail(function(err) {
           console.log(err);
           resolve(err);
         });
    });
}

function setCountInElem(categoryId, count) {
    let countProductsOfCategoryElem = $('#countProductsOfCategory_' + categoryId);
    if (!countProductsOfCategoryElem || countProductsOfCategoryElem.length < 1) {
        return console.log('category not found!');
    }
    countProductsOfCategoryElem.html(count || 0);
}

function chunk(data, chunkSize) {
    if (!data || data.length === 0) return [];

    let dataChunks = [];
    chunkSize = chunkSize || 3;

    for (let i = 0; i < data.length; i += chunkSize) {
        dataChunks.push({
            id: dataChunks.length + 1,
            data: data.slice(i, i + chunkSize)
        });
    }
    return dataChunks;
}