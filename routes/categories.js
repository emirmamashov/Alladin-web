let express = require('express');
let router = express.Router();

module.exports = (app, db) => {
    router.get('/', (req, res) => {
        res.render('categories/index', { title: 'Categories' });
    });

    app.use('/categories', router);
}