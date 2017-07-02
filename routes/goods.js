let express = require('express');
let router = express.Router();

module.exports = (app, db) => {
    router.get('/', (req, res) => {
        res.render('goods/index', { title: 'Goods' });
    });

    router.get('/details', (req, res) => {
        res.render('goods/details', { title: 'details' });
    });

    app.use('/goods', router);
}