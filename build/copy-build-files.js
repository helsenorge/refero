var path = require('path');

var fse = require('fs-extra');

// Directories to ignore
const ignoredDirectories = ['node_modules', 'dist', 'build', 'src/preview'];

// Base directory for relative paths
const baseDir = path.resolve(__dirname, '..');

// Files to copy from the root directory
const rootFiles = ['README.md', 'CHANGES', 'LICENSE'];
const cssFiles = getAllFiles('src', ['.css']);

// Combine all files to copy
const files = [...rootFiles, ...cssFiles];

Promise.all(files.map(file => copyFile(file))).then(() => createPackageFile());

function getAllFiles(dir, extensions) {
  let results = [];
  let list = fse.readdirSync(path.resolve(baseDir, dir));
  list.forEach(function (file) {
    const filePath = path.resolve(baseDir, dir, file);
    let stat = fse.statSync(filePath);

    if (stat && stat.isDirectory()) {
      if (!ignoredDirectories.some(ignoredDir => filePath.includes(path.resolve(baseDir, ignoredDir)))) {
        results = results.concat(getAllFiles(path.relative(baseDir, filePath), extensions));
      }
    } else if (extensions.includes(path.extname(file))) {
      results.push(path.relative(baseDir, filePath));
    }
  });
  return results;
}

function copyFile(file) {
  const srcPath = path.resolve(baseDir, file);
  const destPath = resolveBuildPath(file);

  if (srcPath === destPath) {
    console.log(`Skipping ${file} as source and destination are the same.`);
    return Promise.resolve();
  }

  return new Promise(resolve => {
    fse.copy(srcPath, destPath, err => {
      if (err) throw err;
      resolve();
    });
  }).then(() => console.log(`Copied ${file} to ${destPath}`));
}

function resolveBuildPath(file) {
  const isRootFile = rootFiles.includes(file);
  if (isRootFile) {
    return path.resolve(baseDir, 'lib', file);
  }
  const relativePath = path.relative(path.resolve(baseDir, 'src'), file); // Remove 'src' from path
  return path.resolve(baseDir, 'lib', relativePath);
}

function createPackageFile() {
  return new Promise(resolve => {
    fse.readFile(path.resolve(baseDir, 'package.json'), 'utf8', (err, data) => {
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
        const libPath = path.resolve(baseDir, 'lib/package.json');
        const data = JSON.stringify(minimalPackage, null, 2);
        fse.writeFile(libPath, data, err => {
          if (err) throw err;
          console.log(`Created package.json in ${libPath}`);
          resolve();
        });
      });
    });
}
