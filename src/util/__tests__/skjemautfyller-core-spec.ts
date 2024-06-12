import {
  getRootQuestionnaireResponseItemFromData,
  getQuestionnaireResponseItemWithLinkid,
  getAnswerFromResponseItem,
  hasAnswer,
  getResponseItemWithPath,
  enableWhenMatchesAnswer,
  createPathForItem,
  Path,
} from '../refero-core';
import { QuestionnaireResponseItem, QuestionnaireItemEnableWhen, QuestionnaireItem } from 'fhir/r4';
import { pathify } from '../../reducers/__tests__/utils';
import { dataModel } from './__data__/testDataModel';

describe('getQuestionnaireResponseItemFromData', () => {
  it('should not fail on empty form', () => {
    const response = getRootQuestionnaireResponseItemFromData('123123', {
      Content: null,
    });
    expect(response).toEqual(undefined);
  });
  it('should return response item', () => {
    const item = getRootQuestionnaireResponseItemFromData('decimal2', dataModel.refero.form.FormData);
    expect(item).toBeDefined();
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
  };

  it('should return correct item', () => {
    //should.not.exist(getQuestionnaireResponseItemWithLinkid('123', undefined, false, []));
    expect(getQuestionnaireResponseItemWithLinkid('123', {}, [])).toBeUndefined();
    expect(getQuestionnaireResponseItemWithLinkid('123', data, [])).toBeDefined();
    expect(getQuestionnaireResponseItemWithLinkid('753159', data, [])).toBeUndefined();
    let item = getQuestionnaireResponseItemWithLinkid('456', data, pathify('123', '456'));
    expect(item).toBeDefined();
    if (item) {
      expect(item.linkId).toEqual('456');
    }
    item = getQuestionnaireResponseItemWithLinkid('789', data, pathify('123', '789'));
    expect(item).toBeDefined();
    if (item) {
      expect(item.linkId).toEqual('789');
    }
    item = getQuestionnaireResponseItemWithLinkid('test', data, pathify('123', '789', 'test'));
    expect(item).toBeDefined();
    if (item) {
      expect(item.linkId).toEqual('test');
    }
    item = getQuestionnaireResponseItemWithLinkid('testId', data, pathify('123', '456', 'testId'));
    expect(item).toBeDefined();
    if (item) {
      expect(item.linkId).toEqual('testId');
    }
  });

  it('should return correct item for repeating elements', () => {
    const dataCopy = JSON.parse(JSON.stringify(data));
    if (dataCopy.item && dataCopy.item[0].item) {
      dataCopy.item[0].item[0].answer = [{ valueString: '2' }];
    }
    const repeatingData = { item: [data, dataCopy], linkId: '1' };

    let item = getQuestionnaireResponseItemWithLinkid('testId', repeatingData, [
      { linkId: '1' },
      { linkId: '123', index: 1 },
      { linkId: '456' },
      { linkId: 'testId' },
    ]);
    expect(item).toBeDefined();
    if (item) {
      expect(item.linkId).toEqual('testId');
      expect(item.answer).toBeDefined();
      if (item.answer && item.answer[0].valueString) {
        expect(item.answer[0].valueString).toEqual('2');
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
  };

  it('should return correct answer', () => {
    expect(getAnswerFromResponseItem(undefined)).toBeUndefined();
    expect(getAnswerFromResponseItem({})).toBeUndefined();
    const answer = getAnswerFromResponseItem(data);
    expect(answer).toBeDefined();
    if (answer && 'valueString' in answer && answer.valueString) {
      expect(answer.valueString).toEqual('abc');
    }
  });
});

describe('hasAnswer', () => {
  it('should return no answer on invalid input', () => {
    expect(hasAnswer({})).toEqual(false);
    expect(hasAnswer({ valueCoding: {} })).toEqual(false);
    expect(hasAnswer({ valueDate: undefined })).toEqual(false);
    expect(hasAnswer({ valueDateTime: undefined })).toEqual(false);
    expect(hasAnswer({ valueDecimal: undefined })).toEqual(false);
    expect(hasAnswer({ valueInteger: undefined })).toEqual(false);
    expect(hasAnswer({ valueString: '' })).toEqual(false);
    expect(hasAnswer({ valueString: undefined })).toEqual(false);
    expect(hasAnswer({ valueTime: undefined })).toEqual(false);
  });

  it('should return true if any answer type is given', () => {
    expect(hasAnswer({ valueBoolean: true })).toEqual(true);
    expect(hasAnswer({ valueBoolean: false })).toEqual(true);
    expect(hasAnswer({ valueString: 'asdf' })).toEqual(true);
  });
});

describe('item path', () => {
  it('should create path correct', () => {
    expect(createPathForItem([], { linkId: 'qwe', repeats: true } as QuestionnaireItem, { linkId: 'qwe' }, 1)).toEqual([
      { linkId: 'qwe', index: 1 },
    ]);
    expect(createPathForItem([], { linkId: 'qwe' } as QuestionnaireItem, { linkId: 'qwe' }, undefined)).toEqual([{ linkId: 'qwe' }]);
    let response: Array<Path> = [
      { linkId: 'test', index: 0 },
      { linkId: 'abc', index: 2 },
    ];
    expect(
      createPathForItem([{ linkId: 'test', index: 0 }], { linkId: 'abc', repeats: true } as QuestionnaireItem, { linkId: 'abc' }, 2)
    ).toEqual(response);
    const path = [{ linkId: 'test' }, { linkId: 'test2' }];
    response = [{ linkId: 'test' }, { linkId: 'test2' }, { linkId: 'abc', index: 3 }];
    expect(createPathForItem(path, { linkId: 'abc', repeats: true } as QuestionnaireItem, { linkId: 'abc' }, 3)).toEqual(response);
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
    expect(item).toBeDefined();

    expect(item?.linkId).toEqual('t0');

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
    expect(item).toBeDefined();

    expect(item?.linkId).toEqual('t21');

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
    expect(item).toBeDefined();

    expect(item?.linkId).toEqual('t31.abc');

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
    expect(item).toBeDefined();

    expect(item?.linkId).toEqual('t41');

    path = [
      {
        linkId: 't0',
      },
    ];
    item = getResponseItemWithPath(path, dataModel.refero.form.FormData);
    expect(item).toBeDefined();

    expect(item?.linkId).toEqual('t0');

    path = [
      {
        linkId: 'group1',
      },
      {
        linkId: 'group1.1',
      },
    ];
    item = getResponseItemWithPath(path, dataModel.refero.form.FormData);
    expect(item).toBeDefined();

    expect(item?.linkId).toEqual('group1.1');
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
      { valueString: 'et svar' },
    ]);
    expect(result).toBe(false);
  });
});
