import { createGlobalStateWithQuestionnaire } from '../../utils';
import { GlobalState } from '../../..';
import * as fs from 'fs';

const qr = JSON.parse(fs.readFileSync(__dirname + '/qr.json').toString());
const q = JSON.parse(fs.readFileSync(__dirname + '/q.json').toString());

const dataModel: GlobalState = createGlobalStateWithQuestionnaire(q, qr);
export default dataModel;
