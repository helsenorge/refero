import * as fs from 'fs';
import { Questionnaire } from 'fhir/r4';

const qinline: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/inline.json').toString());
const q: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/q.json').toString());
const qScriptInjection: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/scriptInjection.json').toString());

export { qinline, q, qScriptInjection };
