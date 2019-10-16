import { Questionnaire, QuestionnaireResponse } from '../../../types/fhir';
import { GlobalState } from '../..';

const dataModel: GlobalState = {
  skjemautfyller: {
    form: {
      InitialFormData: {
        Content: undefined,
      },
      Language: 'no',
      FormDefinition: {
        Content: {
          status: {
            value: 'draft',
          },
          resourceType: 'Questionnaire',
          url: 'bundle1Url',
          item: [
            {
              linkId: '1',
              type: 'string',
            },
            {
              linkId: 'b',
              type: 'boolean',
            },
            {
              linkId: 'd',
              type: 'decimal',
              enableWhen: [
                {
                  question: 'b',
                  answerBoolean: true,
                },
              ],
            },
            {
              linkId: 'i',
              type: 'integer',
              enableWhen: [
                {
                  question: 'd',
                  answerDecimal: 2.5,
                },
              ],
            },
            {
              linkId: 'date',
              type: 'date',
            },
            {
              linkId: 'dt',
              type: 'datetime',
            },
            {
              linkId: 't',
              type: 'time',
            },
            {
              linkId: 'c',
              type: 'choice',
            },
            {
              linkId: 't0',
              type: 'string',
              item: [
                {
                  linkId: 't11',
                  type: 'string',
                  item: [
                    {
                      linkId: 't21',
                      type: 'string',
                      item: [
                        {
                          linkId: 't31.abc',
                          type: 'string',
                        },
                        {
                          linkId: 't32.def',
                          type: 'string',
                          item: [
                            {
                              linkId: 't41',
                              type: 'string',
                              enableWhen: [
                                {
                                  question: 'i',
                                  answerInteger: 2,
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      linkId: 't22',
                      type: 'string',
                    },
                  ],
                },
                {
                  linkId: 't12',
                  type: 'string',
                },
              ],
            },
            {
              linkId: 'addGroupTest1',
              type: 'group',
              repeats: true,
              item: [
                {
                  linkId: 'addGroupTest11',
                  type: 'group',
                  item: [
                    {
                      linkId: 'addGroupTest111',
                      type: 'string',
                    },
                  ],
                },
                {
                  linkId: 'addGroupTest12',
                  type: 'string',
                },
              ],
            },
            {
              linkId: 'attachment',
              type: 'attachment',
            },
            {
              linkId: 'group110',
              type: 'group',
              item: [
                {
                  linkId: 'group110.1',
                  type: 'group',
                  repeats: true,
                  item: [
                    {
                      linkId: 'group110.11',
                      type: 'string',
                    },
                  ],
                },
                {
                  linkId: 'group110.111',
                  type: 'string',
                },
              ],
            },
          ],
        } as Questionnaire,
      },
      FormData: {
        Content: {
          questionnaire: {
            reference: 'fakeurl',
          },
          status: 'completed',
          item: [
            {
              linkId: '1',
              type: 'string',
              answer: [
                {
                  valueString: 'test svar',
                },
              ],
            },
            {
              linkId: 'b',
              answer: [
                {
                  valueBoolean: true,
                },
              ],
            },
            {
              linkId: 'd',
              answer: [
                {
                  valueDecimal: 2.5,
                },
              ],
            },
            {
              linkId: 'i',
              answer: [
                {
                  valueInteger: 2,
                },
              ],
            },
            {
              linkId: 'date',
              answer: [
                {
                  valueDate: '2018',
                },
              ],
            },
            {
              linkId: 'dt',
              answer: [
                {
                  valueDateTime: '2018-05-18T10:28:45Z',
                },
              ],
            },
            {
              linkId: 't',
              answer: [
                {
                  valueTime: '10:28',
                },
              ],
            },
            {
              linkId: 'c',
              answer: [
                {
                  valueCoding: {
                    code: 'y',
                    display: 'displayy',
                  },
                },
              ],
            },

            {
              linkId: 't0',
              type: 'string',
              item: [
                {
                  linkId: 't11',
                  type: 'string',
                  item: [
                    {
                      linkId: 't21',
                      type: 'string',
                      item: [
                        {
                          linkId: 't31.abc',
                          type: 'string',
                        },
                        {
                          linkId: 't32.def',
                          type: 'string',
                          item: [
                            {
                              linkId: `t41`,
                              type: 'string',
                            },
                          ],
                        },
                      ],
                    },
                    {
                      linkId: 't22',
                      type: 'string',
                    },
                  ],
                },
                {
                  linkId: 't12',
                  type: 'string',
                },
              ],
            },
            {
              linkId: 'addGroupTest1^0',
              item: [
                {
                  linkId: 'addGroupTest11^0',
                  item: [
                    {
                      linkId: 'addGroupTest111^0',
                    },
                  ],
                },
                {
                  linkId: 'addGroupTest12^0',
                },
              ],
            },
            {
              linkId: 'attachment',
              type: 'attachment',
            },
            {
              linkId: 'group110',
              item: [
                {
                  linkId: 'group110.1^0',
                  item: [
                    {
                      linkId: 'group110.11^0',
                    },
                  ],
                },
                {
                  linkId: 'group110.111',
                },
              ],
            },
          ],
        } as QuestionnaireResponse,
      },
    },
  },
};

export default dataModel;
