const path = require('path')
const Dotenv = require('dotenv-webpack')

module.exports = {
    // specify the entry point for the app
    context: path.resolve(__dirname, 'src'),
    entry: './index.ts',

    // specify the output location for the bundled code
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        libraryTarget: 'module'
    },

    // specify the module rules for handling different types of files
    module: {
        rules: [
            // handle .ts and .tsx files with the ts-loader
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: 'ts-loader'
            }
        ]
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },

    // specify the plugins to use in the webpack build process
    plugins: [
        // use dotenv-webpack to load environment variables from the .env file
        new Dotenv()
    ]
}
