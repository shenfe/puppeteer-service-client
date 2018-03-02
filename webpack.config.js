const path = require('path');

const conf = {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    entry: './src/index.js',
    output: {
        filename: 'puppeteer-service-client.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'PSC',
        libraryTarget: 'umd'
    }
};

module.exports = conf;
