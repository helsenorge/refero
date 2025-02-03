import * as fs from 'fs';

import { Questionnaire } from 'fhir/r4';

const checkboxView: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/checkbox-view.json').toString());
const dropdownView: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/dropdown-view.json').toString());
const radioView: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/radio-view.json').toString());
const sliderView: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/slider-view.json').toString());

export { checkboxView, dropdownView, radioView, sliderView };
