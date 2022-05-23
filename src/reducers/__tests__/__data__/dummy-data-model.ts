import { Questionnaire, QuestionnaireResponse } from '../../../types/fhir';
import { GlobalState } from '../..';

const dataModel: GlobalState = {
  refero: {
    form: {
      Language: 'no',
      FormDefinition: {
        Content: {
          status: 'draft',
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
              enableBehavior: 'any',
              enableWhen: [
                {
                  question: 'b',
                  answerBoolean: true,
                  operator: '=',
                },
              ],
            },
            {
              linkId: 'i',
              type: 'integer',
              enableBehavior: 'any',
              enableWhen: [
                {
                  question: 'd',
                  answerDecimal: 2.5,
                  operator: '=',
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
                              enableBehavior: 'any',
                              enableWhen: [
                                {
                                  question: 'i',
                                  answerInteger: 2,
                                  operator: '=',
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
          questionnaire: 'fakeurl',
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
              linkId: 'addGroupTest1',
              item: [
                {
                  linkId: 'addGroupTest11',
                  item: [
                    {
                      linkId: 'addGroupTest111',
                    },
                  ],
                },
                {
                  linkId: 'addGroupTest12',
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
                  linkId: 'group110.1',
                  item: [
                    {
                      linkId: 'group110.11',
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
