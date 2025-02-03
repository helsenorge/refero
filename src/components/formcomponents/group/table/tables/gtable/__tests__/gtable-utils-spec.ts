import { QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import { QuestionnaireItemWithAnswers } from '../../interface';
import {
  columnsForRowIndex,
  createTableHeader,
  createTableRows,
  getGtablebodyObject,
  getNumberOfRowsGTable,
  getValueFromAnswer,
} from '../utils';

import { Extensions } from '@/constants/extensions';
import ItemType, { IItemType } from '@/constants/itemType';
import { QUESTIONNAIRE_ITEM_CONTROL_SYSTEM } from '@/constants/valuesets';

type MockAnswerProps = Partial<QuestionnaireResponseItemAnswer>;
type MockResponseItemProps = Partial<QuestionnaireResponseItem>;
type MockQuestionnaireItemProps = Partial<Omit<QuestionnaireItem, 'type'>> & {
  type: IItemType;
};
type MockResponseProps = Partial<QuestionnaireResponse>;

function generateMockResponseAnswer(props: MockAnswerProps = {}): QuestionnaireResponseItemAnswer {
  return {
    valueString: 'Default Answer',
    ...props,
  };
}

function generateMockResponseItem(props: MockResponseItemProps = {}): QuestionnaireResponseItem {
  return {
    linkId: 'default-linkId',
    answer: [],
    ...props,
  };
}

function generateMockQuestionnaireItem(props: MockQuestionnaireItemProps): QuestionnaireItem {
  return {
    linkId: 'default-question-linkId',
    text: 'Default Question Text',
    ...props,
  };
}
function generateMockQuestionnaireItemWithAnswers(
  props: Partial<Omit<QuestionnaireItemWithAnswers, 'linkId'>>
): QuestionnaireItemWithAnswers {
  return {
    linkId: 'default-question-linkId',
    type: ItemType.TEXT,
    answer: [],
    ...props,
  };
}
function generateMockQuestionnaireResponse(props: MockResponseProps = {}): QuestionnaireResponse {
  return {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
    item: [],
    ...props,
  };
}

describe('gtable-utils-spec', () => {
  describe('getNumberOfRowsGTable', () => {
    it('should return 0 for an empty array', () => {
      expect(getNumberOfRowsGTable([])).toBe(0);
    });

    it('should return the maximum length of answers from all items', () => {
      const items: QuestionnaireResponseItem[] = [
        generateMockResponseItem({ answer: [generateMockResponseAnswer(), generateMockResponseAnswer()] }),
        generateMockResponseItem({ answer: [generateMockResponseAnswer()] }),
      ];
      expect(getNumberOfRowsGTable(items)).toBe(2);
    });

    it('should handle items with no answers correctly', () => {
      const items: QuestionnaireResponseItem[] = [
        generateMockResponseItem({ answer: [] }),
        generateMockResponseItem({ answer: [generateMockResponseAnswer(), generateMockResponseAnswer(), generateMockResponseAnswer()] }),
      ];
      expect(getNumberOfRowsGTable(items)).toBe(3);
    });
  });
  describe('getValueFromAnswer', () => {
    it('should return an empty string if no answer is provided', () => {
      expect(getValueFromAnswer(0, undefined)).toBe('');
    });

    it('should return the correct string value from the answer at the specified index', () => {
      const answers: QuestionnaireResponseItemAnswer[] = [
        generateMockResponseAnswer({ valueString: 'Answer 1' }),
        generateMockResponseAnswer({ valueString: 'Answer 2' }),
      ];
      const item = generateMockQuestionnaireItemWithAnswers({ answer: answers });
      expect(getValueFromAnswer(1, { ...item, type: ItemType.TEXT })).toBe('Answer 2');
    });

    it('should return an empty string if the index is out of bounds', () => {
      const answers: QuestionnaireResponseItemAnswer[] = [generateMockResponseAnswer({ valueString: 'Answer 1' })];
      const item = generateMockQuestionnaireItemWithAnswers({ answer: answers });
      expect(getValueFromAnswer(2, item)).toBe('');
    });

    it('should return an empty string if the answer at the index is empty', () => {
      const answers: QuestionnaireResponseItemAnswer[] = [generateMockResponseAnswer({ valueString: '' })];
      const item = generateMockQuestionnaireItemWithAnswers({ answer: answers });
      expect(getValueFromAnswer(0, item)).toBe('');
    });
  });
  describe('columnsForRowIndex', () => {
    it('should create columns with correct values for a valid row index', () => {
      const answerItems: QuestionnaireItemWithAnswers[] = [
        generateMockQuestionnaireItemWithAnswers({
          answer: [generateMockResponseAnswer({ valueString: 'Answer 1' }), generateMockResponseAnswer({ valueString: 'Answer 2' })],
          type: ItemType.TEXT,
        }),
        generateMockQuestionnaireItemWithAnswers({
          answer: [generateMockResponseAnswer({ valueString: 'Another Answer 1' })],
          type: ItemType.TEXT,
        }),
      ];
      const columns = columnsForRowIndex(answerItems, 0);
      expect(columns).toEqual([
        { id: 'default-question-linkId', index: 0, value: 'Answer 1', type: ItemType.TEXT },
        { id: 'default-question-linkId', index: 1, value: 'Another Answer 1', type: ItemType.TEXT },
      ]);
    });

    it('should create columns with empty values for a row index with no answers', () => {
      const answerItems: QuestionnaireItemWithAnswers[] = [
        generateMockQuestionnaireItemWithAnswers({ answer: [generateMockResponseAnswer({ valueString: 'Answer 1' })] }),
        generateMockQuestionnaireItemWithAnswers({ answer: [] }),
      ];
      const columns = columnsForRowIndex(answerItems, 1);
      expect(columns).toEqual([
        { id: 'default-question-linkId', index: 0, value: '', type: ItemType.TEXT },
        { id: 'default-question-linkId', index: 1, value: '', type: ItemType.TEXT },
      ]);
    });

    it('should handle empty answer items correctly', () => {
      const answerItems: QuestionnaireItemWithAnswers[] = [];
      const columns = columnsForRowIndex(answerItems, 0);
      expect(columns).toEqual([]);
    });
  });
  describe('createTableRows', () => {
    it('should create table rows based on the input items', () => {
      const items: QuestionnaireItemWithAnswers[] = [
        generateMockQuestionnaireItemWithAnswers({
          answer: [generateMockResponseAnswer({ valueString: 'Answer 1' }), generateMockResponseAnswer({ valueString: 'Answer 2' })],
        }),
        generateMockQuestionnaireItemWithAnswers({
          answer: [generateMockResponseAnswer({ valueString: 'Another Answer 1' })],
        }),
      ];
      const rows = createTableRows(items);
      expect(rows.length).toBe(2);
      expect(rows[0].columns.length).toBe(items.length);
      expect(rows[1].columns.length).toBe(items.length);
    });

    it('should handle items with no answers correctly', () => {
      const items: QuestionnaireItemWithAnswers[] = [
        generateMockQuestionnaireItemWithAnswers({ answer: [] }),
        generateMockQuestionnaireItemWithAnswers({ answer: [generateMockResponseAnswer({ valueString: 'Only Answer' })] }),
      ];
      const rows = createTableRows(items);
      expect(rows.length).toBe(1);
      expect(rows[0].columns.length).toBe(items.length);
    });

    it('should handle empty items correctly', () => {
      const items: QuestionnaireItemWithAnswers[] = [];
      const rows = createTableRows(items);
      expect(rows).toEqual([]);
    });
  });
  describe('createTableHeader', () => {
    it('should create table headers from input items', () => {
      const items: QuestionnaireItem[] = [
        generateMockQuestionnaireItem({ linkId: '1', text: 'First Question', type: 'string' }),
        generateMockQuestionnaireItem({ linkId: '2', text: 'Second Question', type: 'string' }),
      ];
      const headers = createTableHeader(items);
      expect(headers).toEqual([
        { id: '1', value: 'First Question' },
        { id: '2', value: 'Second Question' },
      ]);
    });

    it('should handle items with missing text correctly', () => {
      const items: QuestionnaireItem[] = [
        generateMockQuestionnaireItem({ linkId: '1', type: 'string' }),
        generateMockQuestionnaireItem({ linkId: '2', text: 'Second Question', type: 'string' }),
      ];
      const headers = createTableHeader(items);
      expect(headers).toEqual([
        { id: '1', value: 'Default Question Text' },
        { id: '2', value: 'Second Question' },
      ]);
    });

    it('should handle empty items array correctly', () => {
      const items: QuestionnaireItem[] = [];
      const headers = createTableHeader(items);
      expect(headers).toEqual([]);
    });
  });

  describe('getGtablebodyObject', () => {
    it('should create a GTable object with rows and headers', () => {
      const items: QuestionnaireItem[] = [
        generateMockQuestionnaireItem({
          linkId: '1',
          text: 'First Question',
          type: 'string',
          extension: [
            {
              url: Extensions.ITEMCONTROL_URL,
              valueCodeableConcept: {
                coding: [
                  {
                    system: QUESTIONNAIRE_ITEM_CONTROL_SYSTEM,
                    code: 'data-receiver',
                  },
                ],
              },
            },
            {
              url: Extensions.COPY_EXPRESSION_URL,
              valueString: "QuestionnaireResponse.descendants().where(linkId='1').answer.value",
            },
          ],
        }),
        generateMockQuestionnaireItem({ linkId: '2', text: 'Second Question', type: 'string' }),
      ];
      const questionnaireResponse = generateMockQuestionnaireResponse({
        status: 'completed',
        item: [
          generateMockResponseItem({ linkId: '1', answer: [generateMockResponseAnswer({ valueString: 'Answer 1' })] }),
          generateMockResponseItem({ linkId: '2', answer: [generateMockResponseAnswer({ valueString: 'Answer 2' })] }),
        ],
      });
      const gTable = getGtablebodyObject(items, questionnaireResponse);
      expect(gTable.rows.length).toBe(1);
      expect(gTable.headerRow.length).toBe(2);
      expect(gTable.rows[0].columns.length).toBe(2);
    });

    it('should handle empty questionnaire items correctly', () => {
      const items: QuestionnaireItem[] = [];
      const questionnaireResponse = generateMockQuestionnaireResponse({
        status: 'completed',
        item: [generateMockResponseItem({ linkId: '1', answer: [generateMockResponseAnswer({ valueString: 'Answer 1' })] })],
      });
      const gTable = getGtablebodyObject(items, questionnaireResponse);
      expect(gTable.rows.length).toBe(0);
      expect(gTable.headerRow.length).toBe(0);
    });

    it('should handle null questionnaire response correctly', () => {
      const items: QuestionnaireItem[] = [generateMockQuestionnaireItem({ linkId: '1', text: 'First Question', type: 'string' })];
      const gTable = getGtablebodyObject(items, null);
      expect(gTable.rows.length).toBe(0);
      expect(gTable.headerRow.length).toBe(0);
    });
  });
});
