import * as fs from 'fs';
import { Questionnaire } from 'fhir/r4';

const q: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/q.json').toString());
const qString: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qString.json').toString());
const qInteger: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qInteger.json').toString());
const qDecimal: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qDecimal.json').toString());
const qText: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qText.json').toString());
const qQuantity: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qQuantity.json').toString());
const qBoolean: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qBoolean.json').toString());
const qChoiceRadio: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qChoiceRadio.json').toString());
const qChoiceCheckbox: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qChoiceCheckbox.json').toString());
const qOpenChoiceRadio: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qOpenChoiceRadio.json').toString());
const qOpenChoiceCheckbox: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qOpenChoiceCheckbox.json').toString());
const qChoiceDropdown: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qChoiceDropdown.json').toString());
const qOpenChoiceDropdown: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qOpenChoiceDropdown.json').toString());
const qChoiceSlider: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qChoiceSlider.json').toString());
const qAttachment: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qAttachment.json').toString());
const qDateTime: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qDateTime.json').toString());
const qDateDay: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qDateDay.json').toString());

export {
  q,
  qAttachment,
  qChoiceSlider,
  qOpenChoiceCheckbox,
  qOpenChoiceRadio,
  qString,
  qInteger,
  qDecimal,
  qText,
  qQuantity,
  qBoolean,
  qChoiceRadio,
  qChoiceCheckbox,
  qChoiceDropdown,
  qOpenChoiceDropdown,
  qDateTime,
  qDateDay,
};
