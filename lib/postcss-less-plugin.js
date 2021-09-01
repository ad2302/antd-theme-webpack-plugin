const fs = require("fs");
const path = require("path");
const postcss = require("postcss");
const syntax = require("postcss-less");
const { promisify } = require("util");
const readFile = promisify(fs.readFile);

const localIdentNamePlugin = postcss.plugin(
  "LocalIdentNamePlugin",
  ({ localIdentName, lessPath }) => {
    const relativePath = path.relative(process.cwd(), lessPath);
    const _dir = path.dirname(relativePath) + path.sep;
    const _path = _dir.replace(new RegExp(path.sep, "g"), "-");
    const replacements = {
      "[path]": _path,
      "[name]": path.basename(relativePath, path.extname(relativePath))
    };

    return lessAST => {
      const loop = nodes => {
        nodes.forEach(item => {
          if (item.nodes && item.selector !== ":global") {
            loop(item.nodes);
          }

          if (item.selector === ":global") {
            const parentNodes = item.parent.nodes;
            const childrenNodes = item.nodes;
            const index = parentNodes.findIndex(node => {
              return node.selector === ":global";
            });
            childrenNodes.unshift(index, 1);
            Array.prototype.splice.apply(parentNodes, item.nodes);
            item.parent.nodes = parentNodes;
            return;
          }

          if (item.selector) {
            if (item.selector.includes(":global(")) {
              return;
            }

            const className = item.selector.replace(/\./g, "");
            let _name = localIdentName;
            replacements["[local]"] = className;
            for (const k in replacements) {
              if (replacements[k]) {
                _name = _name.replace(k, replacements[k]);
              }
            }

            item.selector = "." + _name;
          }
        });
      };

      loop(lessAST.nodes);
    };
  }
);

const AddLocalIdentName = async (lessPath, localIdentName) => {
  const buf = await readFile(lessPath);
  const lessText = buf.toString();
  return postcss([localIdentNamePlugin({ localIdentName, lessPath })])
    .process(lessText, { syntax })
    .toString();
};

module.exports = AddLocalIdentName;
