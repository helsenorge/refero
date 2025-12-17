import * as fs from 'fs';

import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

export const q: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/q.json').toString());
export const qr: QuestionnaireResponse = JSON.parse(fs.readFileSync(__dirname + '/qr.json').toString());
