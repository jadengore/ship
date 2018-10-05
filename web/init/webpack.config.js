const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const DashboardPlugin = require("webpack-dashboard/plugin");

const basePlugins = [
  new MiniCssExtractPlugin({
    filename: "[name].css"
  }),
];

module.exports = (env, { mode = "production" }) => {
  let plugins = [...basePlugins];

  if (process.env.DASHBOARD) {
    plugins = plugins.concat(new DashboardPlugin())
  }

  const isProduction = mode === "production";
  let optimization = {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.s?css$/,
          chunks: 'all',
          enforce: true
        }
      }
    }
  };

  if (isProduction) {
    optimization = {
      ...optimization,
      minimizer: [
        new UglifyJsPlugin({
          cache: true,
          parallel: true,
          sourceMap: true
        }),
        new OptimizeCSSAssetsPlugin({})
      ]
    }
  }

  return {
    entry: [
        "babel-polyfill",
        path.resolve(__dirname, 'src/index.js'),
    ],
    mode: "production",
    output: {
      path: path.resolve(__dirname, './dist'),
      filename: 'index.js',
      library: '',
      libraryTarget: 'umd'
    },
    resolve: {
        extensions: ['.json', '.js', '.jsx']
    },
    externals: {
      react: "react",
      "react-dom": "react-dom",
      "monaco-editor": "monaco-editor",
    },
    node: {
        fs: "empty",
        module: "empty"
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              cacheCompression: false,
            }
          }
        },
        {
            test: /\.s?css$/,
            use: [
                MiniCssExtractPlugin.loader,
                "css-loader",
                "sass-loader"
            ]
        },
        {
            test: /\.(png|jpg|ico)$/,
            use: ["file-loader"],
          },
          {
            test: /\.svg/,
            use: ["svg-url-loader"],
          },
          {
            test: /\.woff(2)?(\?v=\d+\.\d+\.\d+)?$/,
            loader: "url-loader?limit=10000&mimetype=application/font-woff&name=./assets/[hash].[ext]",
          },
      ]
    },
    plugins,
    optimization,
  }
};
