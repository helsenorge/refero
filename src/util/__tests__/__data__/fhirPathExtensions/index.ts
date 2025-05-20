import * as fs from 'fs';

const qr = JSON.parse(fs.readFileSync(__dirname + '/qr.json').toString());
const q = JSON.parse(fs.readFileSync(__dirname + '/q.json').toString());

export default {
  qr,
  q,
};
