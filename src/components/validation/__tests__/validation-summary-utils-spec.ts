import { extractLinkIdAndIndexPath } from '../utils';
describe('validation-summary-utils', () => {
  describe('extractLinkIdAndIndexPath', () => {
    it('should extract linkId and indexPath with no indices', () => {
      const fieldNameParts = ['question1'];
      const result = extractLinkIdAndIndexPath(fieldNameParts);
      expect(result).toEqual({ linkId: 'question1', indexPath: [] });
    });

    it('should extract linkId and indexPath with nested fields', () => {
      const fieldNameParts = ['group1', 'question2'];
      const result = extractLinkIdAndIndexPath(fieldNameParts);
      expect(result).toEqual({ linkId: 'group1.question2', indexPath: [] });
    });

    it('should extract linkId and indexPath with indices', () => {
      const fieldNameParts = ['group1^0', 'question2'];
      const result = extractLinkIdAndIndexPath(fieldNameParts);
      expect(result).toEqual({ linkId: 'group1.question2', indexPath: [0] });
    });

    it('should extract linkId and indexPath with multiple indices', () => {
      const fieldNameParts = ['group1^0', 'question2^1'];
      const result = extractLinkIdAndIndexPath(fieldNameParts);
      expect(result).toEqual({ linkId: 'group1.question2', indexPath: [0, 1] });
    });

    it('should extract linkId and indexPath with GUID', () => {
      const fieldNameParts = ['question1-0000-0000-0000-000000000000'];
      const result = extractLinkIdAndIndexPath(fieldNameParts);
      expect(result).toEqual({
        linkId: 'question1-0000-0000-0000-000000000000',
        indexPath: [],
      });
    });

    it('should extract linkId and indexPath with GUID and indices', () => {
      const fieldNameParts = ['question1-0000-0000-0000-000000000000^2'];
      const result = extractLinkIdAndIndexPath(fieldNameParts);
      expect(result).toEqual({
        linkId: 'question1-0000-0000-0000-000000000000',
        indexPath: [2],
      });
    });
  });
});
