module.exports = {
    development: {
        ROOT_DIR: __dirname,
        DB_URL: process.env.DB_URL || 'mongodb://localhost/alladin',
        API_URL: 'http://localhost:3000' // 'http://176.126.167.128:3000' 
    },
    production: {
        ROOT_DIR: __dirname,
        DB_URL: process.env.DB_URL || 'mongodb://localhost/alladin',
        API_URL: 'http://localhost:3000'
    }
}