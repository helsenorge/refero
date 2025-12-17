import * as fs from 'fs';

import type { GlobalState } from '../../..';

import { createGlobalStateWithQuestionnaire } from '../../utils';

const q = JSON.parse(fs.readFileSync(__dirname + '/q.json').toString());
const qr = JSON.parse(fs.readFileSync(__dirname + '/qr.json').toString());

const dataModel: GlobalState = createGlobalStateWithQuestionnaire(q, qr);

export default dataModel;
