module.exports = {
    development: {
        ROOT_DIR: __dirname,
        DB_URL: process.env.DB_URL || 'mongodb://localhost/alladin',
        CountViewsCategoriesInMainPage: 15,
        API_URL: 'http://176.126.167.128:3000' // 'http://localhost:3000'
    },
    production: {
        ROOT_DIR: __dirname,
        DB_URL: process.env.DB_URL || 'mongodb://localhost/alladin',
        CountViewsCategoriesInMainPage: 15,
        API_URL: 'http://localhost:3000'
    }
}