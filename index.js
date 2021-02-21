'use strict';

module.exports = {
  name: require('./package').name,
  options: {
    autoImport: {
      exclude: ['@glimmer/component'],
    },
  },
};
