import {
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
} from '../../../../../../types/fhir';
import {
  columnsForRowIndex,
  createTableHeader,
  createTableRows,
  getGtablebodyObject,
  getNumberOfRowsGTable,
  getValueFromAnswer,
} from '../utils';
import ItemType from '../../../../../../constants/itemType';
type MockAnswerProps = Partial<QuestionnaireResponseItemAnswer>;
type MockResponseItemProps = Partial<QuestionnaireResponseItem>;
type MockQuestionnaireItemProps = Partial<Omit<QuestionnaireItem, 'type'>> & {
  type: string; // Make type a required property
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
    const generateMockQuestionnaireResponseItem = (answers?: QuestionnaireResponseItemAnswer[]): QuestionnaireResponseItem => {
      return { answer: answers } as QuestionnaireResponseItem;
    };

    it('should return an empty string if no answer is provided', () => {
      expect(getValueFromAnswer(0, undefined)).toBe('');
    });

    it('should return the correct string value from the answer at the specified index', () => {
      const answers: QuestionnaireResponseItemAnswer[] = [
        generateMockResponseAnswer({ valueString: 'Answer 1' }),
        generateMockResponseAnswer({ valueString: 'Answer 2' }),
      ];
      const item = generateMockQuestionnaireResponseItem(answers);
      expect(getValueFromAnswer(1, { ...item, type: ItemType.TEXT })).toBe('Answer 2');
    });

    it('should return an empty string if the index is out of bounds', () => {
      const answers: QuestionnaireResponseItemAnswer[] = [generateMockResponseAnswer({ valueString: 'Answer 1' })];
      const item = generateMockQuestionnaireResponseItem(answers);
      expect(getValueFromAnswer(2, item)).toBe('');
    });

    it('should return an empty string if the answer at the index is empty', () => {
      const answers: QuestionnaireResponseItemAnswer[] = [generateMockResponseAnswer({ valueString: '' })];
      const item = generateMockQuestionnaireResponseItem(answers);
      expect(getValueFromAnswer(0, item)).toBe('');
    });
  });
  describe('columnsForRowIndex', () => {
    it('should create columns with correct values for a valid row index', () => {
      const answerItems: QuestionnaireResponseItem[] = [
        generateMockResponseItem({
          answer: [generateMockResponseAnswer({ valueString: 'Answer 1' }), generateMockResponseAnswer({ valueString: 'Answer 2' })],
          //@ts-ignore
          type: ItemType.TEXT,
        }),
        generateMockResponseItem({
          answer: [generateMockResponseAnswer({ valueString: 'Another Answer 1' })],
          //@ts-ignore
          type: ItemType.TEXT,
        }),
      ];
      const columns = columnsForRowIndex(answerItems, 0);
      expect(columns).toEqual([
        { id: 'empty-0-0', index: 0, value: 'Answer 1' },
        { id: 'empty-0-1', index: 1, value: 'Another Answer 1' },
      ]);
    });

    it('should create columns with empty values for a row index with no answers', () => {
      const answerItems: QuestionnaireResponseItem[] = [
        generateMockResponseItem({ answer: [generateMockResponseAnswer({ valueString: 'Answer 1' })] }),
        generateMockResponseItem({ answer: [] }),
      ];
      const columns = columnsForRowIndex(answerItems, 1);
      expect(columns).toEqual([
        { id: 'empty-1-0', index: 0, value: '' },
        { id: 'empty-1-1', index: 1, value: '' },
      ]);
    });

    it('should handle empty answer items correctly', () => {
      const answerItems: QuestionnaireResponseItem[] = [];
      const columns = columnsForRowIndex(answerItems, 0);
      expect(columns).toEqual([]);
    });
  });
  describe('createTableRows', () => {
    it('should create table rows based on the input items', () => {
      const items: QuestionnaireResponseItem[] = [
        generateMockResponseItem({
          answer: [generateMockResponseAnswer({ valueString: 'Answer 1' }), generateMockResponseAnswer({ valueString: 'Answer 2' })],
        }),
        generateMockResponseItem({
          answer: [generateMockResponseAnswer({ valueString: 'Another Answer 1' })],
        }),
      ];
      const rows = createTableRows(items);
      expect(rows.length).toBe(2);
      expect(rows[0].columns.length).toBe(items.length);
      expect(rows[1].columns.length).toBe(items.length);
    });

    it('should handle items with no answers correctly', () => {
      const items: QuestionnaireResponseItem[] = [
        generateMockResponseItem({ answer: [] }),
        generateMockResponseItem({ answer: [generateMockResponseAnswer({ valueString: 'Only Answer' })] }),
      ];
      const rows = createTableRows(items);
      expect(rows.length).toBe(1);
      expect(rows[0].columns.length).toBe(items.length);
    });

    it('should handle empty items correctly', () => {
      const items: QuestionnaireResponseItem[] = [];
      const rows = createTableRows(items);
      expect(rows).toEqual([]);
    });
  });
  describe('createTableHeader', () => {
    it('should create table headers from input items', () => {
      const items: QuestionnaireResponseItem[] = [
        generateMockResponseItem({ linkId: '1', text: 'First Question' }),
        generateMockResponseItem({ linkId: '2', text: 'Second Question' }),
      ];
      const headers = createTableHeader(items);
      expect(headers).toEqual([
        { id: '1', value: 'First Question' },
        { id: '2', value: 'Second Question' },
      ]);
    });

    it('should handle items with missing text correctly', () => {
      const items: QuestionnaireResponseItem[] = [
        generateMockResponseItem({ linkId: '1' }),
        generateMockResponseItem({ linkId: '2', text: 'Second Question' }),
      ];
      const headers = createTableHeader(items);
      expect(headers).toEqual([
        { id: '1', value: '' },
        { id: '2', value: 'Second Question' },
      ]);
    });

    it('should handle empty items array correctly', () => {
      const items: QuestionnaireResponseItem[] = [];
      const headers = createTableHeader(items);
      expect(headers).toEqual([]);
    });
  });

  describe('getGtablebodyObject', () => {
    it('should create a GTable object with rows and headers', () => {
      const questionnaireItems: QuestionnaireItem[] = [
        generateMockQuestionnaireItem({
          linkId: '1',
          text: 'First Question',
          type: 'string',
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control',
                    code: 'data-receiver',
                  },
                ],
              },
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/cqf-expression',
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
      const gTable = getGtablebodyObject(questionnaireItems, questionnaireResponse);
      console.log('gTable', gTable);
      expect(gTable.rows.length).toBe(1);
      expect(gTable.headerRow.length).toBe(2);
    });

    it('should handle empty questionnaire items correctly', () => {
      const questionnaireItems: QuestionnaireItem[] = [];
      const questionnaireResponse = generateMockQuestionnaireResponse({
        status: 'completed',
        item: [generateMockResponseItem({ linkId: '1', answer: [generateMockResponseAnswer({ valueString: 'Answer 1' })] })],
      });
      const gTable = getGtablebodyObject(questionnaireItems, questionnaireResponse);
      expect(gTable.rows.length).toBe(0);
      expect(gTable.headerRow.length).toBe(0);
    });

    it('should handle null questionnaire response correctly', () => {
      const questionnaireItems: QuestionnaireItem[] = [
        generateMockQuestionnaireItem({ linkId: '1', text: 'First Question', type: 'string' }),
      ];
      const gTable = getGtablebodyObject(questionnaireItems, null);
      expect(gTable.rows.length).toBe(0);
      expect(gTable.headerRow.length).toBe(0);
    });
  });
});
