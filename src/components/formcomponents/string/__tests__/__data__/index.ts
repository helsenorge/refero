import * as fs from 'fs';
import { Questionnaire } from 'fhir/r4';

const qScriptInjection: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/q.json').toString());
const q2: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/q2.json').toString());

export { qScriptInjection, q2 as q };
