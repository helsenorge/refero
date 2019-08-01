import { GlobalState } from '../../../';
import { QuestionnaireResponse, Questionnaire } from '../../../../types/fhir';
import * as fs from 'fs';

let qr = JSON.parse(fs.readFileSync(__dirname + '/qr.json').toString());
let q = JSON.parse(fs.readFileSync(__dirname + '/q.json').toString());

const dataModel: GlobalState = {
  skjemautfyller: {
    form: {
      InitialFormData: {
        Content: undefined,
      },
      Language: 'no',
      FormDefinition: {
        Content: <Questionnaire>(<any>q),
      },
      FormData: {
        Content: <QuestionnaireResponse>qr,
      },
    },
  },
};

export default dataModel;
