import * as fs from 'fs';
import { Questionnaire } from 'fhir/r4';

const q: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/q-dateDay.json').toString());
const qMinMax: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/q-dateDay-minMax.json').toString());
const qMinMaxCustomError: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/q-dateDay-minMax-customError.json').toString());
export { q, qMinMax, qMinMaxCustomError };
