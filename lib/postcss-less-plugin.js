const fs = require('fs');
const postcss = require('postcss');
const syntax = require('postcss-less');
const { promisify } = require('util')
const readFile = promisify(fs.readFile);

const LocalIdentNamePlugin = postcss.plugin('LocalIdentNamePlugin', ({ localIdentName, lessPath }) => {
  const filePathArr = lessPath.replace('.less', '').split('xiaoju-bot-pc/')[1].split('/');
  return lessAST => {
    const loop = nodes => {
      nodes.forEach(item => {
        if (item.nodes && item.selector !== ':global') {
          loop(item.nodes);
        }
        if (item.selector === ':global') {
          const parentNodes = item.parent.nodes;
          const childrenNodes = item.nodes;
          const index = parentNodes.findIndex(node => {
            return node.selector === ':global';
          });
          childrenNodes.unshift(index, 1);
          Array.prototype.splice.apply(parentNodes, item.nodes);
          item.parent.nodes = parentNodes;
          return;
        }
        if (item.selector) {
          if (item.selector.includes(':global(')) {
            return;
          }
          const className = item.selector.replace(/\./g, `.${filePathArr.join('-')}__`);
          item.selector = className;
        }
      });
    };
    loop(lessAST.nodes);
  };
});

const AddLocalIdentName = async (lessPath, localIdentName) => {
  const buf = await readFile(lessPath);
  const lessText = buf.toString();
  return postcss([LocalIdentNamePlugin({ localIdentName, lessPath })]).process(lessText, { syntax }).toString();
};

module.exports = AddLocalIdentName;