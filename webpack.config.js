const path = require('path');

module.exports = {
    mode: 'development',
    // mode: 'production',
    entry: './src/index.js',
    output: {
        filename: 'puppeteer-service-client.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'PSC',
        libraryTarget: 'umd'
    }
};