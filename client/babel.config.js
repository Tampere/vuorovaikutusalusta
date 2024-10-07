/**
 * Babel configurations: https://babeljs.io/docs/en/configuration
 * Presets combine a list of plugins which Babel uses for transformations.
 * E.g. 'preset-env' provides plugins for transforming ECMAScript 2015+ code,
 * 'preset-react' provides plugins to transform JSX syntax etc.
 */

module.exports = {
  presets: ['@babel/preset-env', '@babel/preset-react'],
};
