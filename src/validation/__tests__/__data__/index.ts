import * as fs from 'fs';

import type { Questionnaire } from 'fhir/r4';

const q: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/q.json').toString());

const qAttachment: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qAttachment.json').toString());

const qString: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qString.json').toString());
const qString_prefilled: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qString-prefilled.json').toString());

const qInteger: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qInteger.json').toString());
const qInteger_prefilled: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qInteger-prefilled.json').toString());

const qDecimal: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qDecimal.json').toString());
const qDecimal_prefilled: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qDecimal-prefilled.json').toString());

const qText: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qText.json').toString());
const qText_prefilled: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qText-prefilled.json').toString());

const qQuantity: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qQuantity.json').toString());
const qQuantity_prefilled: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qQuantity-prefilled.json').toString());

const qBoolean: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qBoolean.json').toString());
const qBoolean_prefilled: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qBoolean-prefilled.json').toString());

const qChoiceRadio: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qChoiceRadio.json').toString());
const qChoiceRadio_prefilled: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qChoiceRadio-prefilled.json').toString());

const qChoiceCheckbox: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qChoiceCheckbox.json').toString());
const qChoiceCheckbox_prefilled: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qChoiceCheckbox-prefilled.json').toString());

const qChoiceDropdown: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qChoiceDropdown.json').toString());
const qChoiceDropdown_prefilled: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qChoiceDropdown-prefilled.json').toString());

const qChoiceSlider: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qChoiceSlider.json').toString());
const qChoiceSlider_prefilled: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qChoiceSlider-prefilled.json').toString());

const qOpenChoiceRadio: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qOpenChoiceRadio.json').toString());
const qOpenChoiceRadio_prefilled: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qOpenChoiceRadio-prefilled.json').toString());

const qOpenChoiceCheckbox: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qOpenChoiceCheckbox.json').toString());
const qOpenChoiceCheckbox_prefilled: Questionnaire = JSON.parse(
  fs.readFileSync(__dirname + '/qOpenChoiceCheckbox-prefilled.json').toString()
);

const qOpenChoiceDropdown: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qOpenChoiceDropdown.json').toString());
const qOpenChoiceDropdown_prefilled: Questionnaire = JSON.parse(
  fs.readFileSync(__dirname + '/qOpenChoiceDropdown-prefilled.json').toString()
);

const qDateTime: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qDateTime.json').toString());
const qDateTime_prefilled: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qDateTime-prefilled.json').toString());

const qDateDay: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qDateDay.json').toString());
const qDateDay_prefilled: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qDateDay-prefilled.json').toString());

const qDateYear: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qDateYear.json').toString());
const qDateYear_prefilled: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qDateYear-prefilled.json').toString());

const qDateMonth: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qDateMonth.json').toString());
const qDateMonth_prefilled: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qDateMonth-prefilled.json').toString());

const qTime: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qTime.json').toString());
const qTime_prefilled: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/qTime-prefilled.json').toString());

export {
  q,
  qAttachment,
  qString,
  qString_prefilled,
  qInteger,
  qInteger_prefilled,
  qDecimal,
  qDecimal_prefilled,
  qText,
  qText_prefilled,
  qQuantity,
  qQuantity_prefilled,
  qBoolean,
  qBoolean_prefilled,
  qChoiceRadio,
  qChoiceRadio_prefilled,
  qChoiceCheckbox,
  qChoiceCheckbox_prefilled,
  qChoiceDropdown,
  qChoiceDropdown_prefilled,
  qChoiceSlider,
  qChoiceSlider_prefilled,
  qOpenChoiceRadio,
  qOpenChoiceRadio_prefilled,
  qOpenChoiceCheckbox,
  qOpenChoiceCheckbox_prefilled,
  qOpenChoiceDropdown,
  qOpenChoiceDropdown_prefilled,
  qDateTime,
  qDateTime_prefilled,
  qDateDay,
  qDateDay_prefilled,
  qDateYear,
  qDateYear_prefilled,
  qDateMonth,
  qDateMonth_prefilled,
  qTime,
  qTime_prefilled,
};
