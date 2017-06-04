/**
 * Module dependencies.
 */

const babel = require('rollup-plugin-babel');
const replace = require('rollup-plugin-replace');
const resolve = require('rollup-plugin-node-resolve');
const uglify = require('rollup-plugin-uglify');

/**
 * Config.
 */

const config = {
  format: 'umd',
  moduleName: 'cancelable',
  plugins: [
    babel({
      exclude: 'node_modules/**'
    }),
    resolve({ jsnext: true }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ],
  external: ['react', 'prop-types'],
  globals: {
    'prop-types': 'PropTypes',
    react: 'React'
  }
};

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(
    uglify({
      compress: {
        pure_getters: true,
        unsafe_comps: true,
        unsafe: true,
        warnings: false
      }
    })
  );
}

/**
 * Export `config`.
 */

module.exports = config;
