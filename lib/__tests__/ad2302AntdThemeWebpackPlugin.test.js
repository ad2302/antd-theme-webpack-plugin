/* eslint-disable capitalized-comments */
const assert = require("assert");
const path = require("path");
const themeOptions = {
  stylesDir: [],
  antDir: path.dirname(path.dirname(require.resolve("antd"))),
  // varFile: path.join(__dirname, "./src/main.global.less"),
  // mainLessFile: path.join(__dirname, "./src/wrapper.global.less"),
  themeVariables: [
    "@primary-color",
    "@primary-gradient-color",
    "@main-btn-bg",
    "@main-btn-shadow",
    "@main-color-pale"
  ],
  // lessUrl: "https://cdn.botorange.com/js-libs/less_3.11.1.min.js",
  localIdentName: "[path][name]__[local]"
  // publicPath,
  // outputFilePath: path.join(__dirname, 'dist/color.less'),
};

// Const ad2302AntdThemeWebpackPlugin = require("../index.js");
const { generateTheme } = require("../antd-theme-generator");

describe("ad2302AntdThemeWebpackPlugin", () => {
  it("has a test", async () => {
    const c = await generateTheme(themeOptions);
    assert(c.length > 0);
  });
});
