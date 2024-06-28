import * as fs from 'fs';
import { Questionnaire } from 'fhir/r4';

const q: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/q.json').toString());
const string: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/string.json').toString());

export { q, string };
