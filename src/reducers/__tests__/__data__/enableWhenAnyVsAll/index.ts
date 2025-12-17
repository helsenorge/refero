import * as fs from 'fs';

import type { GlobalState } from '../../../';

import { createGlobalStateWithQuestionnaire } from '../../utils';

const all = JSON.parse(fs.readFileSync(__dirname + '/all.json').toString());
const any = JSON.parse(fs.readFileSync(__dirname + '/any.json').toString());
const qr = JSON.parse(fs.readFileSync(__dirname + '/qr.json').toString());

const allDataModel: GlobalState = createGlobalStateWithQuestionnaire(all, qr);
const anyDataModel: GlobalState = createGlobalStateWithQuestionnaire(any, qr);

export default { allDataModel, anyDataModel };
