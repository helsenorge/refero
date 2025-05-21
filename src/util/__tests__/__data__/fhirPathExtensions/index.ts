import * as fs from 'fs';

const qr1 = JSON.parse(fs.readFileSync(__dirname + '/qr.json').toString());
const qr2 = JSON.parse(fs.readFileSync(__dirname + '/qr2.json').toString());
const qr3 = JSON.parse(fs.readFileSync(__dirname + '/qr3.json').toString());
const qr4 = JSON.parse(fs.readFileSync(__dirname + '/qr4.json').toString());
const qr5 = JSON.parse(fs.readFileSync(__dirname + '/qr5.json').toString());

const q = JSON.parse(fs.readFileSync(__dirname + '/q.json').toString());
const q1 = JSON.parse(fs.readFileSync(__dirname + '/q1.json').toString());

export { q, q1, qr1, qr2, qr3, qr4, qr5 };
