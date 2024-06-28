import * as fs from 'fs';
import { Questionnaire } from 'fhir/r4';

const q: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/q.json').toString());
const qString: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qString.json').toString());
const qInteger: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qInteger.json').toString());
const qDecimal: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qDecimal.json').toString());
const qText: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qText.json').toString());
const qQuantity: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qQuantity.json').toString());
const qBoolean: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qBoolean.json').toString());
export { q, qString, qInteger, qDecimal, qText, qQuantity, qBoolean };
