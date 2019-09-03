import * as fs from 'fs';

const Valueset = JSON.parse(fs.readFileSync(__dirname + '/valueset.json').toString());
export default Valueset;
