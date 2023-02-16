import * as fs from 'fs';
import { Questionnaire } from '../../../../types/fhir';

const q: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/q.json').toString());
export default q;