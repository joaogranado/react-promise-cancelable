/**
 * Export babel-plugin-lodash-es.
 */

module.exports = () => ({
  visitor: {
    ImportDeclaration(path) {
      const source = path.node.source;

      source.value = source.value.replace(/^lodash($|\/)/, 'lodash-es$1');
    }
  }
});
