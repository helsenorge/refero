import * as fs from 'fs';

import { Questionnaire } from 'fhir/r4';

const q: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/q.json').toString());
const qRepeats: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qRepeats.json').toString());
const qRepeatsGroup: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qRepeatsGroup.json').toString());
const qBooleanField: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qBooleanField.json').toString());
export { qRepeats, q, qRepeatsGroup, qBooleanField };
