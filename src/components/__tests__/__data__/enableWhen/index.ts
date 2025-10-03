import * as fs from 'fs';

import { Questionnaire } from 'fhir/r4';

const q: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/q.json').toString());
const q2: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/q2.json').toString());
const q3: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/q3.json').toString());

const prr: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/pasRappRepeat.json').toString());

export { q, prr, q2, q2 as simpleRepeatQuestionnaire, q3 };
