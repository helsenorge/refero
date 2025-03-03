import * as fs from 'fs';

const q = JSON.parse(fs.readFileSync(__dirname + '/q.json').toString());

export { q };
