import * as fs from 'fs';
import { Questionnaire } from 'fhir/r4';

const q: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/q.json').toString());
const qHighlight: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qHighlight.json').toString());
export { qHighlight, q };
