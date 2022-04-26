const path = require("path");
module.exports =
  {
    mode: "production",
    entry: "./src/index.js",
    // entry: ['@babel/plugin-transform-runtime', './src/index.js'],
    output:
      {
        path: path.resolve(__dirname,"dist"),
        filename: "bundle.js",
      },
    module:
      {
        rules:
          [
            {
              test: /\.js$/i,
              include: path.resolve(__dirname,"src"),
              use: {
                loader: "babel-loader",
                options:
                  {
                    presets: [
                        "@babel/preset-env",
                    ],
                    plugins: [
                      ["@babel/transform-runtime"]
                    ]
                  },
              },
            },
            {
              test: /\.css$/i,
              include:
                path.resolve(__dirname,"src"),
              use: [
                "style-loader",
                "css-loader",
                "postcss-loader",
              ],
            },
          ],
      },
      performance: {
        maxAssetSize: 10000000,
      },      
    devServer:
      {
        static: path.resolve(__dirname, 'dist'),
        hot: true,
      },
  };
