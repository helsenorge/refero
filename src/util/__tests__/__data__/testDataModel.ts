import { GlobalState } from '../../../reducers';

import Valueset from './valuesets/valueset-8459';

import { Questionnaire, QuestionnaireResponse } from '../../../types/fhir';

import { OPEN_CHOICE_ID, OPEN_CHOICE_LABEL } from '../../../constants';

export const dataModel: GlobalState = {
  refero: {
    form: {
      Language: 'nb-NO',
      FormDefinition: {
        Content: {
          contained: [Valueset],
          status: 'draft',
          item: [
            {
              linkId: 'string1',
              type: 'string',
            },
            {
              linkId: 'string2',
              type: 'string',
              enableBehavior: 'any',
              enableWhen: [
                {
                  question: 'string1',
                  answerString: 'test svar',
                  operator: '=',
                },
              ],
            },
            {
              linkId: 'string3',
              type: 'string',
              enableBehavior: 'any',
              enableWhen: [
                {
                  question: 'string1',
                  answerString: 'test feil',
                  operator: '=',
                },
              ],
            },
            {
              linkId: 'boolean1',
              type: 'boolean',
            },
            {
              linkId: 'boolean2',
              type: 'boolean',
              enableBehavior: 'any',
              enableWhen: [
                {
                  question: 'boolean1',
                  answerBoolean: true,
                  operator: '=',
                },
              ],
            },
            {
              linkId: 'decimal1',
              type: 'decimal',
            },
            {
              linkId: 'decimal2',
              type: 'decimal',
              enableBehavior: 'any',
              enableWhen: [
                {
                  question: 'decimal1',
                  answerDecimal: 2.5,
                  operator: '=',
                },
              ],
            },
            {
              linkId: 'integer1',
              type: 'integer',
            },
            {
              linkId: 'integer2',
              type: 'integer',
              enableBehavior: 'any',
              enableWhen: [
                {
                  question: 'integer1',
                  answerInteger: 2,
                  operator: '=',
                },
                {
                  question: 'decimal2',
                  answerInteger: 888,
                  operator: '=',
                },
              ],
            },
            {
              linkId: 'date1',
              type: 'date',
            },
            {
              linkId: 'date2',
              type: 'date',
              enableBehavior: 'any',
              enableWhen: [
                {
                  question: 'date1',
                  answerDate: '2018',
                  operator: '=',
                },
              ],
            },
            {
              linkId: 'datetime1',
              type: 'dateTime',
            },
            {
              linkId: 'datetime2',
              type: 'dateTime',
              enableBehavior: 'any',
              enableWhen: [
                {
                  question: 'datetime1',
                  answerDateTime: '2018-05-18T10:28:45Z',
                  operator: '=',
                },
              ],
            },
            {
              linkId: 'time1',
              type: 'time',
            },
            {
              linkId: 'time2',
              type: 'time',
              enableBehavior: 'any',
              enableWhen: [
                {
                  question: 'time1',
                  answerTime: '10:28',
                  operator: '=',
                },
              ],
            },
            {
              linkId: 'code1',
              type: 'code',
            },
            {
              linkId: 'code2',
              type: 'code',
              enableBehavior: 'any',
              enableWhen: [
                {
                  question: 'code1',
                  operator: '=',
                  answerCoding: {
                    code: 'code1answer',
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
                              linkId: 't41',
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
              linkId: 'group1',
              type: 'group',
              repeats: true,
              item: [
                {
                  linkId: 'group1.1',
                  type: 'string',
                },
                {
                  linkId: 'group1.2',
                  type: 'string',
                  repeats: true,
                  item: [
                    {
                      linkId: 'group1.2.1',
                      type: 'string',
                      enableBehavior: 'any',
                      enableWhen: [
                        {
                          question: 'group1.2',
                          operator: 'exists',
                          answerBoolean: true,
                        },
                      ],
                    },
                    {
                      linkId: 'group1.2.2',
                      type: 'string',
                      enableBehavior: 'any',
                      enableWhen: [
                        {
                          question: 'group1.1',
                          operator: 'exists',
                          answerBoolean: true,
                        },
                      ],
                    },
                    {
                      linkId: 'group1.3',
                      type: 'string',
                    },
                  ],
                },
              ],
            },
            // 19
            {
              linkId: 'reference1',
              type: 'code',
            },
            // 20
            {
              linkId: 'reference2',
              type: 'code',
              enableBehavior: 'any',
              enableWhen: [
                {
                  question: 'reference1',
                  operator: '=',
                  answerReference: {
                    reference: 'http://ehelse.no/Endpoint/1',
                    display: 'my endpoint',
                  },
                },
              ],
            },

            // 21
            {
              linkId: 'reference1.1',
              type: 'code',
            },
            // 22
            {
              linkId: 'reference2.1',
              type: 'code',
              enableBehavior: 'any',
              enableWhen: [
                {
                  question: 'reference1.1',
                  operator: '=',
                  answerReference: {
                    reference: 'http://ehelse.no/Endpoint/1',
                    display: 'my endpoint',
                  },
                },
              ],
            },

            // 23
            {
              linkId: 'invalid XML1.1',
              text: 'Header: <xml> er "tull" og \'tøys\'!',
              type: 'string',
            },

            // 24
            {
              linkId: 'open-choice1',
              text: 'Open Choice',
              type: 'open-choice',
              options: {
                reference: '#8459',
              },
            },
            // 25
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
                  valueCoding: {
                    system: 'http://unitsofmeasure.org/',
                    code: 'cm',
                    display: 'centimeter',
                  },
                },
              ],
              linkId: 'quantity1',
              type: 'quantity',
            },
            // 26
            {
              linkId: 'quantity2',
              type: 'quantity',
              enableBehavior: 'any',
              enableWhen: [
                {
                  question: 'quantity1',
                  operator: '=',
                  answerQuantity: {
                    value: 42.24,
                    code: 'cm',
                    system: 'http://unitsofmeasure.org/',
                  },
                },
              ],
            },
          ],
        } as Questionnaire,
      },
      FormData: {
        Content: {
          status: 'completed',
          item: [
            {
              linkId: 'string1',
              text: 'text',
              answer: [
                {
                  valueString: 'test svar',
                },
              ],
            },
            {
              linkId: 'string2',
              answer: [
                {
                  valueString: 'string2answer',
                },
              ],
            },
            {
              linkId: 'string3',
              answer: [
                {
                  valueString: 'string3answer',
                },
              ],
            },
            {
              linkId: 'boolean1',
              answer: [
                {
                  valueBoolean: true,
                },
              ],
            },
            {
              linkId: 'boolean2',
              answer: [
                {
                  valueBoolean: true,
                },
              ],
            },
            {
              linkId: 'decimal1',
              answer: [
                {
                  valueDecimal: 2.5,
                },
              ],
            },
            {
              linkId: 'decimal2',
              answer: [
                {
                  valueDecimal: 3,
                },
              ],
            },
            {
              linkId: 'integer1',
              answer: [
                {
                  valueDecimal: 888,
                },
              ],
            },
            {
              linkId: 'integer2',
              answer: [
                {
                  valueDecimal: 888,
                },
              ],
            },
            {
              linkId: 'date1',
              answer: [
                {
                  valueDate: '2018',
                },
              ],
            },
            {
              linkId: 'date2',
              answer: [
                {
                  valueDate: '2017',
                },
              ],
            },
            {
              linkId: 'datetime1',
              answer: [
                {
                  valueDateTime: '2018-05-18T10:28:45Z',
                },
              ],
            },
            {
              linkId: 'datetime2',
              answer: [
                {
                  valueDateTime: '2017-11-18T10:28:45Z',
                },
              ],
            },
            {
              linkId: 'time1',
              answer: [
                {
                  valueTime: '10:28',
                },
              ],
            },
            {
              linkId: 'time2',
              answer: [
                {
                  valueTime: '18:28',
                },
              ],
            },

            {
              linkId: 'code1',
              answer: [
                {
                  valueCoding: {
                    code: 'code1answer',
                  },
                },
              ],
            },
            {
              linkId: 'code2',
              answer: [
                {
                  valueCoding: {
                    code: 'code2answer',
                  },
                },
              ],
            },
            {
              linkId: 't0',
              answer: [
                {
                  valueString: 'test string svar',
                },
              ],
              item: [
                {
                  linkId: 't11',
                  item: [
                    {
                      linkId: 't21',
                      item: [
                        {
                          linkId: 't31.abc',
                        },
                        {
                          linkId: 't32.def',
                          item: [
                            {
                              linkId: 't41',
                              answer: [
                                {
                                  valueString: 'test string svar2',
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      linkId: 't22',
                    },
                  ],
                },
                {
                  linkId: 't12',
                },
              ],
            },
            {
              linkId: 'group1',
              item: [
                {
                  linkId: 'group1.1',
                },
                {
                  linkId: 'group1.2',
                  answer: [
                    {
                      valueString: 'group1.2string',
                    },
                  ],
                  item: [
                    {
                      linkId: 'group1.2.1',
                    },
                    {
                      linkId: 'group1.2.2',
                    },
                  ],
                },
                {
                  linkId: 'group1.2',
                  item: [
                    {
                      linkId: 'group1.2.1',
                    },
                    {
                      linkId: 'group1.2.2',
                    },
                  ],
                },
              ],
            },
            {
              linkId: 'group1',
              item: [
                {
                  linkId: 'group1.1',
                  answer: [
                    {
                      valueString: 'group1.1string',
                    },
                  ],
                },
                {
                  linkId: 'group1.2',
                  answer: [
                    {
                      valueString: 'group1.2string',
                    },
                  ],
                  item: [
                    {
                      linkId: 'group1.2.1',
                    },
                    {
                      linkId: 'group1.2.2',
                    },
                  ],
                },
              ],
            },

            // 19
            {
              linkId: 'reference1',
              answer: [
                {
                  valueCoding: {
                    code: 'http://ehelse.no/Endpoint/1',
                    display: 'my endpoint',
                  },
                },
              ],
            },

            // 20
            {
              linkId: 'reference2',
            },

            // 21
            {
              linkId: 'reference1.1',
              answer: [
                {
                  valueCoding: {
                    code: 'http://ehelse.no/Endpoint/0',
                    display: 'my other endpoint',
                  },
                },
              ],
            },

            // 22
            {
              linkId: 'reference2.1',
            },

            // 23
            {
              linkId: 'invalid XML1.1',
              text: 'Header: <xml> er "tull" og \'tøys\'!',
              answer: [
                {
                  valueString: '<xml> er "Tull" & \'tøys\'!',
                },
              ],
            },

            // 24
            {
              linkId: 'open-choice1',
              text: 'Open Choice',
              answer: [
                {
                  valueCoding: {
                    code: OPEN_CHOICE_ID,
                    display: OPEN_CHOICE_LABEL,
                  },
                },
                {
                  valueString: 'foo',
                },
              ],
            },

            // 25
            {
              linkId: 'quantity1',
              text: 'Quantity',
              answer: [
                {
                  valueQuantity: {
                    value: 42.24,
                    code: 'cm',
                    system: 'http://unitsofmeasure.org/',
                  },
                },
              ],
            },
            // 26
            {
              linkId: 'quantity2',
            },
          ],
        } as QuestionnaireResponse,
      },
    },
  },
};
