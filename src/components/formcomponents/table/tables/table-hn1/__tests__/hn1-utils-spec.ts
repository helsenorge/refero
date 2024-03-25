import itemType from '../../../../../../constants/itemType';
import { QuestionnaireItem, QuestionnaireResponse } from 'fhir/r4';
import { ITableH1Column, TABLE_HN1_TABLE_TYPES } from '../interface';
import * as hn1Utils from '../utils';

describe('HN1 - Utils ', () => {
  describe('createColumnsFromAnswers', () => {
    it('should return an array of columns from items', () => {
      const item = {
        linkId: '1',
        text: 'text',
        type: itemType.GROUP,
        answer: [
          {
            valueString: 'valueString',
          },
        ],
      };
      const expected: ITableH1Column[] = [
        {
          id: '1-question',
          type: TABLE_HN1_TABLE_TYPES.HEADER,
          value: 'text',
        },
        {
          id: '1-answer',
          type: TABLE_HN1_TABLE_TYPES.VALUE,
          value: '',
        },
      ];
      const result = hn1Utils.createColumnsFromAnswers(item);
      expect(result).toEqual(expected);
    });
  });
  describe('transformItemToHN1Row', () => {
    it('should create a table row from items', () => {
      const item = {
        linkId: '1',
        text: 'text',
        type: itemType.GROUP,
        answer: [
          {
            valueString: 'valueString',
          },
        ],
      };
      const expected = {
        id: '1',
        columns: [
          {
            id: '1-question',
            type: TABLE_HN1_TABLE_TYPES.HEADER,
            value: 'text',
          },
          {
            id: '1-answer',
            type: TABLE_HN1_TABLE_TYPES.VALUE,
            value: '',
          },
        ],
      };
      const result = hn1Utils.transformItemToHN1Row(item);
      expect(result).toEqual(expected);
    });
  });
  describe('getTableHN1bodyObject', () => {
    it('should return an empty array if no questionnaireResponse', () => {
      const items: QuestionnaireItem[] = [];
      const questionnaireResponse = null;
      const result = hn1Utils.getTableHN1bodyObject(items, questionnaireResponse);
      expect(result).toEqual([]);
    });
    it('should return an empty array if no items', () => {
      const items: QuestionnaireItem[] = [];
      const questionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
        item: [
          {
            linkId: '1',
            text: 'text',
            answer: [
              {
                valueString: 'valueString',
              },
            ],
          },
        ],
      };
      const result = hn1Utils.getTableHN1bodyObject(items, questionnaireResponse);
      expect(result).toEqual([]);
    });
    it('should return an array of rows', () => {
      const items: QuestionnaireItem[] = [
        {
          linkId: '1',
          text: 'text',
          type: itemType.GROUP,
        },
        {
          linkId: '2',
          text: 'text 2',
          type: itemType.GROUP,
        },
      ];
      const questionnaireResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
        item: [
          {
            linkId: '1',
            text: 'text',
            answer: [
              {
                valueString: 'valueString',
              },
            ],
          },
          {
            linkId: '2',
            text: 'text 2',
            answer: [
              {
                valueInteger: 12,
              },
            ],
          },
        ],
      };
      const expected = [
        {
          id: '1',
          columns: [
            {
              id: '1-question',
              type: TABLE_HN1_TABLE_TYPES.HEADER,
              value: 'text',
            },
            {
              id: '1-answer',
              type: TABLE_HN1_TABLE_TYPES.VALUE,
              value: '',
            },
          ],
        },
        {
          id: '2',
          columns: [
            {
              id: '2-question',
              type: TABLE_HN1_TABLE_TYPES.HEADER,
              value: 'text 2',
            },
            {
              id: '2-answer',
              type: TABLE_HN1_TABLE_TYPES.VALUE,
              value: '',
            },
          ],
        },
      ];
      const result = hn1Utils.getTableHN1bodyObject(items, questionnaireResponse);
      expect(result).toEqual(expected);
    });
  });
});
