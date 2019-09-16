import * as chai from 'chai';
import {
  getQuestionnaireResponseItemFromData,
  getQuestionnaireResponseItemWithLinkid,
  getAnswerFromResponseItem,
  hasAnswer,
  createPathForItem,
  getResponseItemWithPath,
  getItemWithTypeFromArray,
  enableWhenMatchesAnswer,
} from '../skjemautfyller-core';
import {
  QuestionnaireResponseItem,
  Questionnaire,
  QuestionnaireResponse,
  QuestionnaireResponseAnswer,
  QuestionnaireItem,
  QuestionnaireEnableWhen,
} from '../../types/fhir';
import { GlobalState } from '../../reducers/index';
import itemType from '../../constants/itemType';
import { OPEN_CHOICE_ID, OPEN_CHOICE_LABEL } from '../../constants';
import Valueset from './__data__/valuesets/valueset-8459';

const should = chai.should();

export const dataModel: GlobalState = {
  skjemautfyller: {
    form: {
      Language: 'nb-NO',
      FormDefinition: {
        Content: <Questionnaire>{
          contained: [Valueset],
          status: {
            value: 'draft',
          },
          item: [
            {
              linkId: 'string1',
              type: 'string',
            },
            {
              linkId: 'string2',
              type: 'string',
              enableWhen: [
                {
                  question: 'string1',
                  answerString: 'test svar',
                },
              ],
            },
            {
              linkId: 'string3',
              type: 'string',
              enableWhen: [
                {
                  question: 'string1',
                  answerString: 'test feil',
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
              enableWhen: [
                {
                  question: 'boolean1',
                  answerBoolean: true,
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
              enableWhen: [
                {
                  question: 'decimal1',
                  answerDecimal: 2.5,
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
              enableWhen: [
                {
                  question: 'integer1',
                  answerInteger: 2,
                },
                {
                  question: 'decimal2',
                  answerInteger: 888,
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
              enableWhen: [
                {
                  question: 'date1',
                  answerDate: '2018',
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
              enableWhen: [
                {
                  question: 'datetime1',
                  answerDateTime: '2018-05-18T10:28:45Z',
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
              enableWhen: [
                {
                  question: 'time1',
                  answerTime: '10:28',
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
              enableWhen: [
                {
                  question: 'code1',
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
              item: [
                {
                  linkId: 'group1.1',
                  type: 'string',
                },
                {
                  linkId: 'group1.2',
                  type: 'string',
                  item: [
                    {
                      linkId: 'group1.2.1',
                      type: 'string',
                      enableWhen: [
                        {
                          question: '1.2',
                          hasAnswer: true,
                        },
                      ],
                    },
                    {
                      linkId: 'group1.2.2',
                      type: 'string',
                      enableWhen: [
                        {
                          question: '1.1',
                          hasAnswer: true,
                        },
                      ],
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
              enableWhen: [
                {
                  question: 'reference1',
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
              enableWhen: [
                {
                  question: 'reference1.1',
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
          ],
        },
      },
      FormData: {
        Content: <QuestionnaireResponse>{
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
          ],
        },
      },
      InitialFormData: {
        Content: undefined,
      },
    },
  },
};

describe('getQuestionnaireResponseItemFromData', () => {
  it('should not fail on empty form', () => {
    const response = getQuestionnaireResponseItemFromData('123123', {
      Content: null,
    });
    expect(response).toEqual(undefined);
  });
  it('should return response item', () => {
    const item = getQuestionnaireResponseItemFromData('decimal2', dataModel.skjemautfyller.form.FormData);
    should.exist(item);
  });
});

describe('get questionnaireResponse item', () => {
  const data = {
    linkId: '123',
    item: [
      {
        linkId: '456',
        item: [
          {
            linkId: 'testId',
          },
        ],
      },
    ],
    answer: [
      {
        item: [
          {
            linkId: '789',
            item: [
              {
                linkId: 'test',
              },
            ],
          },
        ],
      },
    ],
  } as QuestionnaireResponseItem;

  it('should return correct item', () => {
    should.not.exist(getQuestionnaireResponseItemWithLinkid('123', undefined));
    should.not.exist(getQuestionnaireResponseItemWithLinkid('123', {} as QuestionnaireResponseItem));
    should.not.exist(getQuestionnaireResponseItemWithLinkid('123', data));
    should.not.exist(getQuestionnaireResponseItemWithLinkid('753159', data));
    let item = getQuestionnaireResponseItemWithLinkid('456', data);
    should.exist(item);
    if (item) {
      item.linkId.should.equal('456');
    }
    item = getQuestionnaireResponseItemWithLinkid('789', data);
    should.exist(item);
    if (item) {
      item.linkId.should.equal('789');
    }
    item = getQuestionnaireResponseItemWithLinkid('test', data, true);
    should.exist(item);
    if (item) {
      item.linkId.should.equal('test');
    }
    item = getQuestionnaireResponseItemWithLinkid('testId', data, true);
    should.exist(item);
    if (item) {
      item.linkId.should.equal('testId');
    }
  });
});

describe('get answer from questionnareReponse', () => {
  const data: QuestionnaireResponseItem = {
    linkId: '123',
    answer: [
      {
        valueString: 'abc',
        item: [
          {
            linkId: '789',
          },
        ],
      },
      {
        valueString: 'def',
      },
    ],
  } as QuestionnaireResponseItem;

  it('should return correct answer', () => {
    should.not.exist(getAnswerFromResponseItem(undefined));
    should.not.exist(getAnswerFromResponseItem({} as QuestionnaireResponseItem));
    const answer = getAnswerFromResponseItem(data);
    should.exist(answer);
    if (answer && 'valueString' in answer && answer.valueString) {
      answer.valueString.should.equal('abc');
    }
  });
});

describe('hasAnswer', () => {
  it('should return no answer on invalid input', () => {
    expect(hasAnswer(<QuestionnaireResponseAnswer>{})).toEqual(false);
    expect(hasAnswer(<QuestionnaireResponseAnswer>{ valueCoding: {} })).toEqual(false);
    expect(hasAnswer(<QuestionnaireResponseAnswer>{ valueDate: undefined })).toEqual(false);
    expect(hasAnswer(<QuestionnaireResponseAnswer>{ valueDateTime: undefined })).toEqual(false);
    expect(hasAnswer(<QuestionnaireResponseAnswer>{ valueDecimal: undefined })).toEqual(false);
    expect(hasAnswer(<QuestionnaireResponseAnswer>{ valueInteger: undefined })).toEqual(false);
    expect(hasAnswer(<QuestionnaireResponseAnswer>{ valueString: '' })).toEqual(false);
    expect(hasAnswer(<QuestionnaireResponseAnswer>{ valueString: undefined })).toEqual(false);
    expect(hasAnswer(<QuestionnaireResponseAnswer>{ valueTime: undefined })).toEqual(false);
  });

  it('should return true if any answer type is given', () => {
    expect(hasAnswer(<QuestionnaireResponseAnswer>{ valueBoolean: true })).toEqual(true);
    expect(hasAnswer(<QuestionnaireResponseAnswer>{ valueBoolean: false })).toEqual(true);
    expect(hasAnswer(<QuestionnaireResponseAnswer>{ valueString: 'asdf' })).toEqual(true);
  });
});

describe('item path', () => {
  it('should create path correct', () => {
    expect(createPathForItem([], <QuestionnaireItem>{ linkId: 'qwe' }, <QuestionnaireResponseItem>{ linkId: 'qwe^1' })).toEqual([
      { linkId: 'qwe^1' },
    ]);
    expect(createPathForItem([], <QuestionnaireItem>{ linkId: 'qwe' }, <QuestionnaireResponseItem>{ linkId: 'qwe^2' })).toEqual([
      { linkId: 'qwe^2' },
    ]);
    let response = [{ linkId: 'test' }, { linkId: 'abc^2' }];
    expect(
      createPathForItem([{ linkId: 'test' }], <QuestionnaireItem>{ linkId: 'abc' }, <QuestionnaireResponseItem>{ linkId: 'abc^2' })
    ).toEqual(response);
    let path = [{ linkId: 'test' }, { linkId: 'test2' }];
    response = [{ linkId: 'test' }, { linkId: 'test2' }, { linkId: 'abc^3' }];
    expect(createPathForItem(path, <QuestionnaireItem>{ linkId: 'abc' }, <QuestionnaireResponseItem>{ linkId: 'abc^3' })).toEqual(response);
  });
});

describe('get item with path', () => {
  it('should return undefined on invalid data', () => {
    expect(getResponseItemWithPath(undefined, dataModel.skjemautfyller.form.FormData)).toBeUndefined();
    expect(getResponseItemWithPath([], dataModel.skjemautfyller.form.FormData)).toBeUndefined();
  });

  it('should return undefined on non existent path', () => {
    expect(getResponseItemWithPath([{ linkId: 'markus' }], dataModel.skjemautfyller.form.FormData)).toBeUndefined();
  });

  it('should return data', () => {
    let item = getResponseItemWithPath([{ linkId: 't0' }], dataModel.skjemautfyller.form.FormData);
    should.exist(item);
    if (!item) {
      fail();
      return;
    }
    expect(item.linkId).toEqual('t0');

    let path = [
      {
        linkId: 't0',
      },
      {
        linkId: 't11',
      },
      {
        linkId: 't21',
      },
    ];
    item = getResponseItemWithPath(path, dataModel.skjemautfyller.form.FormData);
    should.exist(item);
    if (!item) {
      fail();
      return;
    }
    expect(item.linkId).toEqual('t21');

    path = [
      {
        linkId: 't0',
      },
      {
        linkId: 't11',
      },
      {
        linkId: 't21',
      },
      {
        linkId: 't31.abc',
      },
    ];
    item = getResponseItemWithPath(path, dataModel.skjemautfyller.form.FormData);
    should.exist(item);
    if (!item) {
      fail();
      return;
    }
    expect(item.linkId).toEqual('t31.abc');

    path = [
      {
        linkId: 't0',
      },
      {
        linkId: 't11',
      },
      {
        linkId: 't21',
      },
      {
        linkId: 't32.def',
      },
      {
        linkId: 't41',
      },
    ];
    item = getResponseItemWithPath(path, dataModel.skjemautfyller.form.FormData);
    should.exist(item);
    if (!item) {
      fail();
      return;
    }
    expect(item.linkId).toEqual('t41');

    path = [
      {
        linkId: 't0',
      },
    ];
    item = getResponseItemWithPath(path, dataModel.skjemautfyller.form.FormData);
    should.exist(item);
    if (!item) {
      fail();
      return;
    }
    expect(item.linkId).toEqual('t0');

    path = [
      {
        linkId: 'group1',
      },
      {
        linkId: 'group1.1',
      },
    ];
    item = getResponseItemWithPath(path, dataModel.skjemautfyller.form.FormData);
    should.exist(item);
    if (!item) {
      fail();
      return;
    }
    expect(item.linkId).toEqual('group1.1');
  });
});

describe('getItemWithTypeFromArray', () => {
  it('should return correct items', () => {
    const item1: QuestionnaireResponseItem = {
      linkId: '123',
      answer: [
        {
          valueAttachment: { title: '' },
        },
      ],
    } as QuestionnaireResponseItem;
    const item2: QuestionnaireResponseItem = {
      linkId: '123',
      answer: [
        {
          valueString: 'lala',
        },
      ],
    } as QuestionnaireResponseItem;
    const response = getItemWithTypeFromArray(itemType.ATTATCHMENT, [item1, item2]);
    expect(response).toMatchSnapshot();
  });

  it('should not fail on empty answer array', () => {
    const item1: QuestionnaireResponseItem = {
      linkId: '123',
      answer: [],
    } as QuestionnaireResponseItem;
    const response = getItemWithTypeFromArray(itemType.ATTATCHMENT, [item1]);
    expect(response).toMatchSnapshot();
  });
});
describe('Given a Questionnaire with hasAnswer=false', () => {
  it('When an item does not have an answer then enablewhen should return true', () => {
    const result = enableWhenMatchesAnswer({ question: '1.0.0', hasAnswer: false } as QuestionnaireEnableWhen, undefined);
    expect(result).toBe(true);
  });

  it('When an item does have an answer then enablewhen should return false', () => {
    const result = enableWhenMatchesAnswer({ question: '1.0.0', hasAnswer: false } as QuestionnaireEnableWhen, [
      { valueString: 'et svar' } as QuestionnaireResponseAnswer,
    ]);
    expect(result).toBe(false);
  });
});
