let ArrayOperationService = {};
ArrayOperationService.checkUnique =function(elem, arrays) {
    let foundElem = arrays.filter(x => x == elem);
    if (foundElem && foundElem.length > 0) {
        return arrays;
    }
    arrays.push(elem);
    return arrays;
}