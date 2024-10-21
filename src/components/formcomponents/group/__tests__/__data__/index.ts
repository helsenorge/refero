import * as fs from 'fs';
import { Questionnaire } from 'fhir/r4';

const q: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/q.json').toString());
export const repeatQ: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/repeatQ.json').toString());

export default q;
