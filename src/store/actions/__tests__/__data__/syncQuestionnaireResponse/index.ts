import * as fs from 'fs';
import { Questionnaire, QuestionnaireResponse } from '../../../../types/fhir';

export const q: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/q.json').toString());
export const qr: QuestionnaireResponse = JSON.parse(fs.readFileSync(__dirname + '/qr.json').toString());
export const qrMissingFieldFromTopLevelGroup: QuestionnaireResponse = JSON.parse(
  fs.readFileSync(__dirname + '/qr-missingFieldFromTopLevelGroup.json').toString()
);
export const qrMissingGroupFromTopLevelGroup: QuestionnaireResponse = JSON.parse(
  fs.readFileSync(__dirname + '/qr-missingGroupFromTopLevelGroup.json').toString()
);
export const qrMissingNestedFieldFromTopLevelField: QuestionnaireResponse = JSON.parse(
  fs.readFileSync(__dirname + '/qr-missingNestedFieldFromTopLevelField.json').toString()
);
export const qrMissingTopLevelField: QuestionnaireResponse = JSON.parse(
  fs.readFileSync(__dirname + '/qr-missingTopLevelField.json').toString()
);
export const qrMissingTopLevelGroup: QuestionnaireResponse = JSON.parse(
  fs.readFileSync(__dirname + '/qr-missingTopLevelGroup.json').toString()
);
export const qrTypeChanged: QuestionnaireResponse = JSON.parse(fs.readFileSync(__dirname + '/qr-typeChanged.json').toString());
export const qrSuperfluousTopLevelField: QuestionnaireResponse = JSON.parse(
  fs.readFileSync(__dirname + '/qr-superfluousTopLevelField.json').toString()
);
export const qrSuperfluousNestedField: QuestionnaireResponse = JSON.parse(
  fs.readFileSync(__dirname + '/qr-superfluousNestedField.json').toString()
);
