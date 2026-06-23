import * as path from 'path';
import { fileURLToPath } from 'url';
import 'webpack-dev-server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (env) => ({
    mode: env?.production ? 'production' : 'development',
    entry: {
        main: './src/index.js',
    },
    module: {
        parser: {
            javascript: {
                url: false,
            },
        },
        rules: [
            {
                test: /\.(?:js|mjs|cjs)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.mjs'],
        fallback: {
            fs: false,
        },
    },
    devtool: 'source-map',
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    devServer: {
        static: [
            { directory: path.resolve(__dirname, 'public') },
            {
                directory: path.resolve(__dirname, '../../../data/notre_dame_crowdsourced_photogrammetry'),
                publicPath: '/models/notre-dame',
            },
        ],
        port: 8080,
        open: true,
    },
});
