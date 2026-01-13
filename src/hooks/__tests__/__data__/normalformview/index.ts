import * as fs from 'fs';

import type { Questionnaire } from 'fhir/r4';

const NormalFormViewQuestionnaire: Questionnaire = JSON.parse(fs.readFileSync(__dirname + '/q.json').toString());
export default NormalFormViewQuestionnaire;
