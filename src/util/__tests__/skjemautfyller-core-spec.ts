import * as chai from 'chai';
import {
  getQuestionnaireResponseItemFromData,
  getQuestionnaireResponseItemWithLinkid,
  getAnswerFromResponseItem,
  selectComponent,
  hasAnswer,
  createPathForItem,
  getResponseItemWithPath,
  mapDispatchToProps,
  createNarrative,
  getItemWithTypeFromArray,
  getQuestionnaireDefinitionItem,
} from '../skjemautfyller-core';
import {
  QuestionnaireResponseItem,
  Questionnaire,
  QuestionnaireResponse,
  QuestionnaireResponseAnswer,
  QuestionnaireItem,
} from '../../types/fhir';
import { GlobalState } from '../../reducers/index';
import { Props } from '../../components/with-common-functions';
import itemType from '../../constants/itemType';

const should = chai.should();

const dataModel: GlobalState = {
  skjemautfyller: {
    form: {
      Language: 'nb-NO',
      FormDefinition: {
        Content: <Questionnaire>{
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
          ],
        },
      },
      InitialFormData: {
        Content: undefined,
      },
    },
  },
};

describe('generateNarrative', () => {
  it('should not fail on empty input', () => {
    expect(createNarrative(null)).toEqual('');
  });

  it('should create narrative correct', () => {
    const expectedResult =
      '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>string1. text?</b></p><p>test svar</p><p><b>string2.</b></p><p>string2answer</p><p><b>string3.</b></p><p>string3answer</p><p><b>boolean1.</b></p><p>true</p><p><b>boolean2.</b></p><p>true</p><p><b>decimal1.</b></p><p>2.5</p><p><b>decimal2.</b></p><p>3</p><p><b>integer1.</b></p><p>888</p><p><b>integer2.</b></p><p>888</p><p><b>date1.</b></p><p>2018-01-01T00:00:00.000Z</p><p><b>date2.</b></p><p>2017-01-01T00:00:00.000Z</p><p><b>datetime1.</b></p><p>2018-05-18T10:28:45.000Z</p><p><b>datetime2.</b></p><p>2017-11-18T10:28:45.000Z</p><p><b>time1.</b></p><p>10:28</p><p><b>time2.</b></p><p>18:28</p><p><b>code1.</b></p><p>code1answer</p><p><b>code2.</b></p><p>code2answer</p><p><b>t0.</b></p><p>test string svar</p><p><b>t11.</b></p><p><b>t21.</b></p><p><b>t31.abc.</b></p><p><b>t32.def.</b></p><p><b>t41.</b></p><p>test string svar2</p><p><b>t22.</b></p><p><b>t12.</b></p><p><b>group1.</b></p><p><b>group1.1.</b></p><p><b>group1.2.</b></p><p>group1.2string</p><p><b>group1.2.1.</b></p><p><b>group1.2.2.</b></p><p><b>reference1.</b></p><p>http://ehelse.no/Endpoint/1</p><p><b>reference2.</b></p><p><b>reference1.1.</b></p><p>http://ehelse.no/Endpoint/0</p><p><b>reference2.1.</b></p><p><b>invalid XML1.1. Header: &lt;xml&gt; er &quot;tull&quot; og &apos;tøys&apos;!?</b></p><p>&lt;xml&gt; er &quot;Tull&quot; &amp; &apos;tøys&apos;!</p></div>';
    expect(createNarrative(dataModel.skjemautfyller.form.FormData.Content)).toEqual(expectedResult);
  });
});

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

describe('selectComponent', () => {
  it('should enable component when no enableWhen field', () => {
    const result = selectComponent(dataModel, {
      item: { linkId: '1' },
    } as Props);
    const enable = result.enable;
    should.exist(enable);
    expect(enable).toEqual(true);
  });

  it('should enable component when correct string answer', () => {
    if (
      !dataModel ||
      !dataModel.skjemautfyller ||
      !dataModel.skjemautfyller.form.FormDefinition ||
      !dataModel.skjemautfyller.form.FormDefinition.Content ||
      !dataModel.skjemautfyller.form.FormDefinition.Content.item
    ) {
      return;
    }
    const result = selectComponent(dataModel, {
      item: dataModel.skjemautfyller.form.FormDefinition.Content.item[1],
    } as Props);

    const enable = result.enable;
    should.exist(enable);
    expect(enable).toEqual(true);
  });

  it('should not enable component when incorrect answer', () => {
    if (
      !dataModel ||
      !dataModel.skjemautfyller ||
      !dataModel.skjemautfyller.form.FormDefinition ||
      !dataModel.skjemautfyller.form.FormDefinition.Content ||
      !dataModel.skjemautfyller.form.FormDefinition.Content.item
    ) {
      return;
    }
    const result = selectComponent(dataModel, {
      item: dataModel.skjemautfyller.form.FormDefinition.Content.item[2],
    } as Props);
    const enable = result.enable;
    should.exist(enable);
    expect(enable).toEqual(false);
  });

  it('should enable component when correct boolean answer', () => {
    if (
      !dataModel ||
      !dataModel.skjemautfyller ||
      !dataModel.skjemautfyller.form.FormDefinition ||
      !dataModel.skjemautfyller.form.FormDefinition.Content ||
      !dataModel.skjemautfyller.form.FormDefinition.Content.item
    ) {
      return;
    }
    const result = selectComponent(dataModel, {
      item: dataModel.skjemautfyller.form.FormDefinition.Content.item[4],
    } as Props);

    const enable = result.enable;
    should.exist(enable);
    expect(enable).toEqual(true);
  });

  it('should enable component when correct decimal answer', () => {
    if (
      !dataModel ||
      !dataModel.skjemautfyller ||
      !dataModel.skjemautfyller.form.FormDefinition ||
      !dataModel.skjemautfyller.form.FormDefinition.Content ||
      !dataModel.skjemautfyller.form.FormDefinition.Content.item
    ) {
      return;
    }
    const result = selectComponent(dataModel, {
      item: dataModel.skjemautfyller.form.FormDefinition.Content.item[6],
    } as Props);
    const enable = result.enable;
    should.exist(enable);
    expect(enable).toEqual(true);
  });

  it('should not enable component when wrong integer answer', () => {
    if (
      !dataModel ||
      !dataModel.skjemautfyller ||
      !dataModel.skjemautfyller.form.FormDefinition ||
      !dataModel.skjemautfyller.form.FormDefinition.Content ||
      !dataModel.skjemautfyller.form.FormDefinition.Content.item
    ) {
      return;
    }
    const result = selectComponent(dataModel, {
      item: dataModel.skjemautfyller.form.FormDefinition.Content.item[8],
    } as Props);
    const enable = result.enable;
    should.exist(enable);
    expect(enable).toEqual(false);
  });

  it('should enable component when correct date answer', () => {
    if (
      !dataModel ||
      !dataModel.skjemautfyller ||
      !dataModel.skjemautfyller.form.FormDefinition ||
      !dataModel.skjemautfyller.form.FormDefinition.Content ||
      !dataModel.skjemautfyller.form.FormDefinition.Content.item
    ) {
      return;
    }
    const result = selectComponent(dataModel, {
      item: dataModel.skjemautfyller.form.FormDefinition.Content.item[10],
    } as Props);
    const enable = result.enable;
    should.exist(enable);
    expect(enable).toEqual(true);
  });

  it('should enable component when correct datetime answer', () => {
    if (
      !dataModel ||
      !dataModel.skjemautfyller ||
      !dataModel.skjemautfyller.form.FormDefinition ||
      !dataModel.skjemautfyller.form.FormDefinition.Content ||
      !dataModel.skjemautfyller.form.FormDefinition.Content.item
    ) {
      return;
    }
    const result = selectComponent(dataModel, {
      item: dataModel.skjemautfyller.form.FormDefinition.Content.item[12],
    } as Props);

    const enable = result.enable;
    should.exist(enable);
    expect(enable).toEqual(true);
  });

  it('should enable component when correct time answer', () => {
    if (
      !dataModel ||
      !dataModel.skjemautfyller ||
      !dataModel.skjemautfyller.form.FormDefinition ||
      !dataModel.skjemautfyller.form.FormDefinition.Content ||
      !dataModel.skjemautfyller.form.FormDefinition.Content.item
    ) {
      return;
    }
    const result = selectComponent(dataModel, {
      item: dataModel.skjemautfyller.form.FormDefinition.Content.item[14],
    } as Props);
    const enable = result.enable;
    should.exist(enable);
    expect(enable).toEqual(true);
  });

  it('should enable component when correct code answer', () => {
    if (
      !dataModel ||
      !dataModel.skjemautfyller ||
      !dataModel.skjemautfyller.form.FormDefinition ||
      !dataModel.skjemautfyller.form.FormDefinition.Content ||
      !dataModel.skjemautfyller.form.FormDefinition.Content.item
    ) {
      return;
    }
    const result = selectComponent(dataModel, {
      item: dataModel.skjemautfyller.form.FormDefinition.Content.item[16],
    } as Props);

    const enable = result.enable;
    should.exist(enable);
    expect(enable).toEqual(true);
  });

  it('should enable reference-component if has correct answer', () => {
    if (
      !dataModel ||
      !dataModel.skjemautfyller ||
      !dataModel.skjemautfyller.form.FormDefinition ||
      !dataModel.skjemautfyller.form.FormDefinition.Content ||
      !dataModel.skjemautfyller.form.FormDefinition.Content.item
    ) {
      return;
    }

    let item = dataModel.skjemautfyller.form.FormDefinition.Content.item[20];
    const result = selectComponent(dataModel, {
      item: item,
    } as Props);

    const enable = result.enable;
    should.exist(enable);
    expect(enable).toEqual(true);
  });

  it('should not enable reference-component if has incorrect answer', () => {
    if (
      !dataModel ||
      !dataModel.skjemautfyller ||
      !dataModel.skjemautfyller.form.FormDefinition ||
      !dataModel.skjemautfyller.form.FormDefinition.Content ||
      !dataModel.skjemautfyller.form.FormDefinition.Content.item
    ) {
      return;
    }

    let item = dataModel.skjemautfyller.form.FormDefinition.Content.item[22];
    const result = selectComponent(dataModel, {
      item: item,
    } as Props);

    const enable = result.enable;
    should.exist(enable);
    expect(enable).toEqual(false);
  });

  it('should not enable component if has no answer', () => {
    if (
      !dataModel ||
      !dataModel.skjemautfyller ||
      !dataModel.skjemautfyller.form.FormDefinition ||
      !dataModel.skjemautfyller.form.FormDefinition.Content ||
      !dataModel.skjemautfyller.form.FormDefinition.Content.item
    ) {
      return;
    }
    let item = getQuestionnaireDefinitionItem('group1.2.2', dataModel.skjemautfyller.form.FormDefinition.Content.item);
    should.exist(item);
    const result = selectComponent(dataModel, {
      item: item,
    } as Props);
    const enable = result.enable;
    should.exist(enable);
    expect(enable).toEqual(false);
  });

  it('should not enable component if has answer', () => {
    if (
      !dataModel ||
      !dataModel.skjemautfyller ||
      !dataModel.skjemautfyller.form.FormDefinition ||
      !dataModel.skjemautfyller.form.FormDefinition.Content ||
      !dataModel.skjemautfyller.form.FormDefinition.Content.item
    ) {
      return;
    }
    const result = selectComponent(dataModel, {
      item: dataModel.skjemautfyller.form.FormDefinition.Content.item[18],
    } as Props);
    const enable = result.enable;
    should.exist(enable);
    expect(enable).toEqual(true);
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

describe('mapDispatchToProps', () => {
  it('should return object', () => {
    const props = mapDispatchToProps(() => {}, { path: [] });
    should.exist(props.dispatch);
    should.exist(props.path);
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
