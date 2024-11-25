import * as fs from 'fs';
import { Questionnaire } from 'fhir/r4';

const q: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/q.json').toString());
const qCustomErrorMessage: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/q-customErrorMessage.json').toString());
export { q, qCustomErrorMessage };
