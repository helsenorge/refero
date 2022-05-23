var path = require('path');
var fse = require('fs-extra');

//Files to copy
const files = ['README.md', 'CHANGES', 'LICENSE'];

Promise.all(files.map(file => copyFile(file))).then(() => createPackageFile());

function copyFile(file) {
  const libPath = resolveBuildPath(file);
  return new Promise(resolve => {
    fse.copy(file, libPath, err => {
      if (err) throw err;
      resolve();
    });
  }).then(() => console.log(`Copied ${file} to ${libPath}`));
}

function resolveBuildPath(file) {
  return path.resolve(__dirname, '../lib/', path.basename(file));
}

function createPackageFile() {
  return new Promise(resolve => {
    fse.readFile(path.resolve(__dirname, '../package.json'), 'utf8', (err, data) => {
      if (err) {
        throw err;
      }

      resolve(data);
    });
  })
    .then(data => JSON.parse(data))
    .then(packageData => {
      const { author, version, peerDependencies, license, dependencies } = packageData;

      const minimalPackage = {
        name: '@helsenorge/refero',
        author,
        version,
        main: './index.js',
        license,
        peerDependencies,
        dependencies,
      };

      return new Promise(resolve => {
        const libPath = path.resolve(__dirname, '../lib/package.json');
        const data = JSON.stringify(minimalPackage, null, 2);
        fse.writeFile(libPath, data, err => {
          if (err) throw err;
          console.log(`Created package.json in ${libPath}`);
          resolve();
        });
      });
    });
}
