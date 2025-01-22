import * as fs from 'fs';
import { Questionnaire } from 'fhir/r4';

export const q: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/q.json').toString());
export const repeatQ: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/repeatQ.json').toString());
//Dette skjemaet innholder en repeterende gruppe inni en repeterende gruppe
export const repeatQ2: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/repeatQ2.json').toString());
