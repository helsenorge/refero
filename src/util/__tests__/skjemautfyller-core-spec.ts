import * as chai from 'chai';
import {
  getRootQuestionnaireResponseItemFromData,
  getQuestionnaireResponseItemWithLinkid,
  getAnswerFromResponseItem,
  hasAnswer,
  getResponseItemWithPath,
  getItemWithTypeFromArray,
  enableWhenMatchesAnswer,
  createPathForItem,
  Path,
} from '../refero-core';
import {
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
  QuestionnaireItemEnableWhen,
  QuestionnaireItem,
} from '../../types/fhir';
import itemType from '../../constants/itemType';
import { pathify } from '../../reducers/__tests__/utils';
import { dataModel } from './__data__/testDataModel';

const should = chai.should();

describe('getQuestionnaireResponseItemFromData', () => {
  it('should not fail on empty form', () => {
    const response = getRootQuestionnaireResponseItemFromData('123123', {
      Content: null,
    });
    expect(response).toEqual(undefined);
  });
  it('should return response item', () => {
    const item = getRootQuestionnaireResponseItemFromData('decimal2', dataModel.refero.form.FormData);
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
    //should.not.exist(getQuestionnaireResponseItemWithLinkid('123', undefined, false, []));
    should.not.exist(getQuestionnaireResponseItemWithLinkid('123', {} as QuestionnaireResponseItem, []));
    should.exist(getQuestionnaireResponseItemWithLinkid('123', data, []));
    should.not.exist(getQuestionnaireResponseItemWithLinkid('753159', data, []));
    let item = getQuestionnaireResponseItemWithLinkid('456', data, pathify('123', '456'));
    should.exist(item);
    if (item) {
      item.linkId.should.equal('456');
    }
    item = getQuestionnaireResponseItemWithLinkid('789', data, pathify('123', '789'));
    should.exist(item);
    if (item) {
      item.linkId.should.equal('789');
    }
    item = getQuestionnaireResponseItemWithLinkid('test', data, pathify('123', '789', 'test'));
    should.exist(item);
    if (item) {
      item.linkId.should.equal('test');
    }
    item = getQuestionnaireResponseItemWithLinkid('testId', data, pathify('123', '456', 'testId'));
    should.exist(item);
    if (item) {
      item.linkId.should.equal('testId');
    }
  });

  it('should return correct item for repeating elements', () => {
    const dataCopy = JSON.parse(JSON.stringify(data)) as QuestionnaireResponseItem;
    if (dataCopy.item && dataCopy.item[0].item) {
      dataCopy.item[0].item[0].answer = [{ valueString: '2' } as QuestionnaireResponseItemAnswer];
    }
    const repeatingData = { item: [data, dataCopy], linkId: '1' } as QuestionnaireResponseItem;

    let item = getQuestionnaireResponseItemWithLinkid('testId', repeatingData, [
      { linkId: '1' },
      { linkId: '123', index: 1 },
      { linkId: '456' },
      { linkId: 'testId' },
    ]);
    should.exist(item);
    if (item) {
      item.linkId.should.equal('testId');
      should.exist(item.answer);
      if (item.answer && item.answer[0].valueString) {
        item.answer[0].valueString.should.equal('2');
      }
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
    expect(hasAnswer({} as QuestionnaireResponseItemAnswer)).toEqual(false);
    expect(hasAnswer({ valueCoding: {} } as QuestionnaireResponseItemAnswer)).toEqual(false);
    expect(hasAnswer({ valueDate: undefined } as QuestionnaireResponseItemAnswer)).toEqual(false);
    expect(hasAnswer({ valueDateTime: undefined } as QuestionnaireResponseItemAnswer)).toEqual(false);
    expect(hasAnswer({ valueDecimal: undefined } as QuestionnaireResponseItemAnswer)).toEqual(false);
    expect(hasAnswer({ valueInteger: undefined } as QuestionnaireResponseItemAnswer)).toEqual(false);
    expect(hasAnswer({ valueString: '' } as QuestionnaireResponseItemAnswer)).toEqual(false);
    expect(hasAnswer({ valueString: undefined } as QuestionnaireResponseItemAnswer)).toEqual(false);
    expect(hasAnswer({ valueTime: undefined } as QuestionnaireResponseItemAnswer)).toEqual(false);
  });

  it('should return true if any answer type is given', () => {
    expect(hasAnswer({ valueBoolean: true } as QuestionnaireResponseItemAnswer)).toEqual(true);
    expect(hasAnswer({ valueBoolean: false } as QuestionnaireResponseItemAnswer)).toEqual(true);
    expect(hasAnswer({ valueString: 'asdf' } as QuestionnaireResponseItemAnswer)).toEqual(true);
  });
});

describe('item path', () => {
  it('should create path correct', () => {
    expect(
      createPathForItem([], { linkId: 'qwe', repeats: true } as QuestionnaireItem, { linkId: 'qwe' } as QuestionnaireResponseItem, 1)
    ).toEqual([{ linkId: 'qwe', index: 1 }]);
    expect(
      createPathForItem([], { linkId: 'qwe' } as QuestionnaireItem, { linkId: 'qwe' } as QuestionnaireResponseItem, undefined)
    ).toEqual([{ linkId: 'qwe' }]);
    let response: Array<Path> = [
      { linkId: 'test', index: 0 },
      { linkId: 'abc', index: 2 },
    ];
    expect(
      createPathForItem(
        [{ linkId: 'test', index: 0 }],
        { linkId: 'abc', repeats: true } as QuestionnaireItem,
        { linkId: 'abc' } as QuestionnaireResponseItem,
        2
      )
    ).toEqual(response);
    const path = [{ linkId: 'test' }, { linkId: 'test2' }];
    response = [{ linkId: 'test' }, { linkId: 'test2' }, { linkId: 'abc', index: 3 }];
    expect(
      createPathForItem(path, { linkId: 'abc', repeats: true } as QuestionnaireItem, { linkId: 'abc' } as QuestionnaireResponseItem, 3)
    ).toEqual(response);
  });
});

describe('get item with path', () => {
  it('should return undefined on invalid data', () => {
    expect(getResponseItemWithPath([], dataModel.refero.form.FormData)).toBeUndefined();
  });

  it('should return undefined on non existent path', () => {
    expect(getResponseItemWithPath([{ linkId: 'markus' }], dataModel.refero.form.FormData)).toBeUndefined();
  });

  it('should return data', () => {
    let item = getResponseItemWithPath([{ linkId: 't0' }], dataModel.refero.form.FormData);
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
    item = getResponseItemWithPath(path, dataModel.refero.form.FormData);
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
    item = getResponseItemWithPath(path, dataModel.refero.form.FormData);
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
    item = getResponseItemWithPath(path, dataModel.refero.form.FormData);
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
    item = getResponseItemWithPath(path, dataModel.refero.form.FormData);
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
    item = getResponseItemWithPath(path, dataModel.refero.form.FormData);
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
describe('Given a Questionnaire with operator="exists" and answerBoolean=false', () => {
  it('When an item does not have an answer then enablewhen should return true', () => {
    const result = enableWhenMatchesAnswer(
      { question: '1.0.0', operator: 'exists', answerBoolean: false } as QuestionnaireItemEnableWhen,
      undefined
    );
    expect(result).toBe(true);
  });

  it('When an item does have an answer then enablewhen should return false', () => {
    const result = enableWhenMatchesAnswer({ question: '1.0.0', operator: 'exists', answerBoolean: false } as QuestionnaireItemEnableWhen, [
      { valueString: 'et svar' } as QuestionnaireResponseItemAnswer,
    ]);
    expect(result).toBe(false);
  });
});
