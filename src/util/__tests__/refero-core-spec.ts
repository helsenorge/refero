import itemType from '../../constants/itemType';
import {
  type Path,
  createIdSuffix,
  descendantsHasPrimitiveAnswer,
  findFirstGuidInString,
  getQuestionnaireItemsWithType,
  parseIdSuffix,
} from '../refero-core';
import { GroupRepeatWithAnswer, GroupRepeatWithNoAnswer } from './__data__/valuesets/valueset-8459';

describe('utils', () => {
  describe('findQuestionnaireItemWithType, in parent', () => {
    it('returns LinkIds to attachments', () => {
      const items = [
        {
          type: itemType.ATTATCHMENT,
          linkId: '1',
          text: 'Text',
        },
        {
          type: itemType.ATTATCHMENT,
          linkId: '2',
          text: 'Attachment',
        },
      ];

      const itemsWithType = getQuestionnaireItemsWithType(itemType.ATTATCHMENT, items);
      expect(itemsWithType).toEqual(expect.arrayContaining([expect.objectContaining({ linkId: '2' })]));
    });

    it('returns LinkIds to attachments, in children', () => {
      const items = [
        {
          type: itemType.TEXT,
          linkId: '1',
          text: 'Text',
        },
        {
          type: itemType.GROUP,
          linkId: '2',
          text: 'Group',
          item: [
            {
              linkId: '2.1',
              text: 'Attachment',
              type: itemType.ATTATCHMENT,
            },
          ],
        },
      ];

      const itemsWithType = getQuestionnaireItemsWithType(itemType.ATTATCHMENT, items);
      expect(itemsWithType).toEqual(expect.arrayContaining([expect.objectContaining({ linkId: '2.1' })]));
    });

    it('returns LinkIds to attachments, several attachments', () => {
      const items = [
        {
          type: itemType.ATTATCHMENT,
          linkId: '1',
          text: 'Attachment',
        },
        {
          type: itemType.GROUP,
          linkId: '2',
          text: 'Group',
          item: [
            {
              linkId: '2.1',
              text: 'Attachment',
              type: itemType.ATTATCHMENT,
              item: [
                {
                  linkId: '2.1.1',
                  text: 'Attachment',
                  type: itemType.ATTATCHMENT,
                },
              ],
            },
          ],
        },
      ];

      const itemsWithType = getQuestionnaireItemsWithType(itemType.ATTATCHMENT, items);
      expect(itemsWithType).toEqual(expect.arrayContaining([expect.objectContaining({ linkId: '1' })]));
      expect(itemsWithType).toEqual(expect.arrayContaining([expect.objectContaining({ linkId: '2.1' })]));
      expect(itemsWithType).toEqual(expect.arrayContaining([expect.objectContaining({ linkId: '2.1.1' })]));
    });
  });

  describe('createIdSuffix', () => {
    it('should create a suffix with indices from path and additional index when repeats is true', () => {
      const path: Path[] = [
        { linkId: 'link1', index: 1 },
        { linkId: 'link2', index: 2 },
      ];
      const result = createIdSuffix(path, 3, true);
      expect(result).toBe('-0^1-1^2^3');
    });

    it('should create a suffix with indices from path only when repeats is false', () => {
      const path: Path[] = [
        { linkId: 'link1', index: 1 },
        { linkId: 'link2', index: 2 },
      ];
      const result = createIdSuffix(path, 3, false);
      expect(result).toBe('-0^1-1^2');
    });

    it('should handle undefined path and return index only when repeats is true', () => {
      const result = createIdSuffix(undefined, 3, true);
      expect(result).toBe('^3');
    });

    it('should handle empty path and return empty string when repeats is false', () => {
      const result = createIdSuffix([], 3, false);
      expect(result).toBe('');
    });

    it('should handle path with undefined indices correctly', () => {
      const path: Path[] = [
        { linkId: 'link1', index: undefined },
        { linkId: 'link2', index: 2 },
      ];
      const result = createIdSuffix(path, 3, true);
      expect(result).toBe('-1^2^3');
    });

    it('should handle zero index correctly', () => {
      const path: Path[] = [
        { linkId: 'link1', index: 0 },
        { linkId: 'link2', index: 2 },
      ];
      const result = createIdSuffix(path, 3, true);
      expect(result).toBe('-1^2^3');
    });
    it('should handle very complex paths correctly', () => {
      const path: Path[] = [
        { linkId: 'Z' },
        { linkId: 'Z.2', index: 0 },
        { linkId: 'Z.2.1', index: 1 },
        { linkId: 'Z.2.1.2', index: 0 },
        { linkId: 'Z.2.1.2.2', index: 1 },
        { linkId: 'Z.2.1.2.2.2' },
      ];
      const result = createIdSuffix(path, 3, true);
      expect(result).toBe('-2^1-4^1^3');
    });
    it('two paths with same amount of index: 1 should not be equal if the index are on different pathindexes', () => {
      const path1: Path[] = [
        { linkId: 'Z' },
        { linkId: 'Z.2', index: 0 },
        { linkId: 'Z.2.1', index: 1 },
        { linkId: 'Z.2.1.2', index: 0 },
        { linkId: 'Z.2.1.2.2', index: 1 },
        { linkId: 'Z.2.1.2.2.2' },
      ];
      const path2: Path[] = [
        { linkId: 'Z' },
        { linkId: 'Z.2', index: 1 },
        { linkId: 'Z.2.1', index: 0 },
        { linkId: 'Z.2.1.2', index: 0 },
        { linkId: 'Z.2.1.2.2', index: 1 },
        { linkId: 'Z.2.1.2.2.2' },
      ];
      const result = createIdSuffix(path1, 3, true);
      const result2 = createIdSuffix(path2, 3, true);
      expect(result).not.toEqual(result2);
    });
  });

  describe('parseIdSuffix', () => {
    it('should parse a string with linkId and suffix into a path array correctly', () => {
      const input = 'link1^1^2^3';
      const result = parseIdSuffix(input);
      expect(result).toEqual([
        { linkId: 'link1' },
        { linkId: 'link1', index: 1 },
        { linkId: 'link1', index: 2 },
        { linkId: 'link1', index: 3 },
      ]);
    });

    it('should handle a string with only a linkId correctly', () => {
      const input = 'link1';
      const result = parseIdSuffix(input);
      expect(result).toEqual([{ linkId: 'link1' }]);
    });

    it('should handle a string with non-numeric values as NaN', () => {
      const input = 'link1^1^a^3';
      const result = parseIdSuffix(input);
      expect(result).toEqual([
        { linkId: 'link1' },
        { linkId: 'link1', index: 1 },
        { linkId: 'link1', index: NaN },
        { linkId: 'link1', index: 3 },
      ]);
    });

    it('should handle a string with leading and trailing separators correctly', () => {
      const input = 'link1^1^2^3^';
      const result = parseIdSuffix(input);
      expect(result).toEqual([
        { linkId: 'link1' },
        { linkId: 'link1', index: 1 },
        { linkId: 'link1', index: 2 },
        { linkId: 'link1', index: 3 },
      ]);
    });

    it('should handle a string with multiple separators correctly', () => {
      const input = 'link1^1^^3';
      const result = parseIdSuffix(input);
      expect(result).toEqual([{ linkId: 'link1' }, { linkId: 'link1', index: 1 }, { linkId: 'link1', index: 3 }]);
    });

    it('should handle a string with only separators correctly', () => {
      const input = 'link1^^^';
      const result = parseIdSuffix(input);
      expect(result).toEqual([{ linkId: 'link1' }]);
    });
  });

  describe('findFirstGuid', () => {
    it('should return the first GUID in the string', () => {
      const inputString = 'Here is a string with a GUID 123e4567-e89b-12d3-a456-426614174000 in it.';
      const result = findFirstGuidInString(inputString);
      expect(result).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should return null if there is no GUID in the string', () => {
      const inputString = 'This string does not contain a GUID.';
      const result = findFirstGuidInString(inputString);
      expect(result).toBeNull();
    });

    it('should return the first GUID when multiple GUIDs are present', () => {
      const inputString = 'Multiple GUIDs: 123e4567-e89b-12d3-a456-426614174000 and 987e6543-e21b-45d3-b456-123456789012.';
      const result = findFirstGuidInString(inputString);
      expect(result).toBe('123e4567-e89b-12d3-a456-426614174000');
    });
  });

  describe('descendantsHasPrimitiveAnswer', () => {
    it('should group be repeatable, when one item has asnwer', () => {
      const item = GroupRepeatWithAnswer;

      const result = descendantsHasPrimitiveAnswer(item);
      expect(result).toBeTruthy();
    });

    it('should group not be repeatable, when items has no asnwer', () => {
      const item = GroupRepeatWithNoAnswer;

      const result = descendantsHasPrimitiveAnswer(item);
      expect(result).toBeFalsy();
    });
  });
});
