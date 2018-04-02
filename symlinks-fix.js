/**
 * Fixes symlinks for CRNA / Expo. See https://github.com/facebook/metro/issues/1
 * Starts Expo with a generated symlinks-config.js if any symlinked depencencies are found.
 * Thanks to S. Bird, N. Ding, N. Couvrat.
 */

const packageJson = require('./package.json');
const fs = require('fs');
const exec = require('child_process').execSync;
const appJson = require('./app.json');
const RN_CLI_CONFIG_NAME = `symlinks-config.js`;

const main = () => {
  const deps = Object.keys(
    Object.assign({}, packageJson.dependencies, packageJson.devDependencies)
  );

  const symlinkPaths = getSymlinkPaths(deps);
  generateRnCliConfig(symlinkPaths, RN_CLI_CONFIG_NAME)
  generateExpoConfig(RN_CLI_CONFIG_NAME)
  runBundlerWithConfig(RN_CLI_CONFIG_NAME)
}

const getSymlinkPaths = deps => {
  const depLinks = [];
  const depPaths = [];
  deps.forEach(dep => {
    const stat = fs.lstatSync('node_modules/' + dep);
    if (stat.isSymbolicLink()) {
      depLinks.push(dep);
      depPaths.push(fs.realpathSync('node_modules/' + dep));
    }
  });

  console.log(`Starting React Native / Expo with symlinked modules:
  
    ${depLinks.map((link, i) => link + ` -> ` + depPaths[i])}
  `)

  return depPaths;
}

const generateRnCliConfig = (symlinkPaths, configName) => {
  const fileBody = `
var path = require('path');
var blacklist = require('metro/src/blacklist');

var config = {
  extraNodeModules: {
    'react-native': path.resolve(__dirname, 'node_modules/react-native')
  },
  getBlacklistRE() {
    return blacklist([
      ${symlinkPaths.map(
        path =>
          `/${path.replace(
            /\//g,
            '[/\\\\]'
          )}[/\\\\]node_modules[/\\\\]react-native[/\\\\].*/`
      )}
    ]);
  },
  getProjectRoots() {
    return [
      // Keep your project directory.
      path.resolve(__dirname),

      // Include your forked package as a new root.
      ${symlinkPaths.map(path => `path.resolve('${path}')`)}
    ];
  }
};
module.exports = config;
  `;

  fs.writeFileSync(configName, fileBody);
}

// Adds config to Expo's packagerOpts in app.json
const generateExpoConfig = configName => {
  appJson.expo.packagerOpts = { ...appJson.expo.packagerOpts, projectRoots: "", config: configName }
  const fileBody = JSON.stringify(appJson, 0, 2)
  fs.writeFileSync('app.json', fileBody)
}

const runBundlerWithConfig = configName => {
  exec(
    `yarn start`,
    { stdio: [0, 1, 2] }
  );
}

main()