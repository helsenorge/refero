import * as fs from 'fs';
import { Questionnaire, QuestionnaireResponse } from '../../../../types/fhir';

export const q: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/q.json').toString());
export const qr: QuestionnaireResponse = JSON.parse(fs.readFileSync(__dirname + '/qr.json').toString());
export const qrWithOldLinkIds: QuestionnaireResponse = JSON.parse(fs.readFileSync(__dirname + '/qrWithOldLinkIds.json').toString());
