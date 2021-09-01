/* eslint-disable capitalized-comments */
const { generateTheme } = require("./antd-theme-generator");
const webpack = require("webpack");
const { RawSource } = webpack.sources || require("webpack-sources");
// const path = require("path");
const { createHash } = require("crypto");
class AntDesignThemePlugin {
  constructor(options) {
    const defaultOptions = {
      // varFile: path.join(__dirname, "../../src/styles/variables.less"),
      // antDir: path.join(__dirname, "../../node_modules/antd"),
      // stylesDir: path.join(__dirname, "../../src/styles/antd"),
      themeVariables: ["@primary-color"],
      generateOnce: false,
      lessUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/less.js/2.7.2/less.min.js",
      publicPath: ""
    };
    this.options = Object.assign(defaultOptions, options);
    this.generated = false;
    this.version = webpack.version;
  }

  apply(compiler) {
    const pluginName = "AntDesignThemePlugin";

    if (this.version.startsWith("5.")) {
      compiler.hooks.thisCompilation.tap(pluginName, compilation => {
        compilation.hooks.processAssets.tapAsync(
          {
            name: pluginName,
            stage: webpack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE
          },
          (assets, callback) => this.addAssets(compilation, assets, callback)
        );
      });
    } else {
      compiler.hooks.emit.tapAsync(pluginName, (compilation, callback) =>
        this.addAssets(compilation, compilation.assets, callback)
      );
    }
  }

  addAssets(compilation, assets, callback) {
    if (this.options.generateOnce && this.colors) {
      this.generateColorStylesheet(compilation, this.colors);
      return callback();
    }

    generateTheme(this.options)
      .then(css => {
        if (this.options.generateOnce) {
          this.colors = css;
        }

        this.generateColorStylesheet(compilation, css);
        callback();
      })
      .catch(err => {
        callback(err);
      });
  }

  generateColorStylesheet(compilation, source) {
    if (this.version.startsWith("5.")) {
      compilation.emitAsset("color.less", new RawSource(source), {
        size: source.length
      });
      return;
    }

    const code = createHash("sha1")
      .update(source)
      .digest("hex");
    compilation.assets["color.less"] = {
      source: () => source,
      code: () => code,
      size: () => source.length
    };
  }
}

module.exports = AntDesignThemePlugin;
