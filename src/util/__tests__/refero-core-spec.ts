import itemType from '../../constants/itemType';
import { QuestionnaireItem } from '../../types/fhir';
import { getQuestionnaireItemsWithType } from '../refero-core';

describe('utils', () => {
  describe('findQuestionnaireItemWithType, in parent', () => {
    it('returns LinkIds to attachments', () => {
      const items = [{
        type: itemType.ATTATCHMENT,
        linkId: "1",
        text: "Text"
      }, {
        type: itemType.ATTATCHMENT,
        linkId: "2",
        text: "Attachment"
      }] as QuestionnaireItem[];

      const itemsWithType = getQuestionnaireItemsWithType(itemType.ATTATCHMENT, items);
      expect(itemsWithType).toEqual(expect.arrayContaining([expect.objectContaining({"linkId": "2"})]));
    });

    it('returns LinkIds to attachments, in children', () => {
      const items = [{
        type: itemType.TEXT,
        linkId: "1",
        text: "Text"
      }, {
        type: itemType.GROUP,
        linkId: "2",
        text: "Group",
        item: [{
          linkId: "2.1",
          text: "Attachment",
          type: itemType.ATTATCHMENT
        }] as QuestionnaireItem[]
      }] as QuestionnaireItem[];

      const itemsWithType = getQuestionnaireItemsWithType(itemType.ATTATCHMENT, items);
      expect(itemsWithType).toEqual(expect.arrayContaining([expect.objectContaining({"linkId": "2.1"})]));
    });

    it('returns LinkIds to attachments, several attachments', () => {
      const items = [{
        type: itemType.ATTATCHMENT,
        linkId: "1",
        text: "Attachment"
      }, {
        type: itemType.GROUP,
        linkId: "2",
        text: "Group",
        item: [{
          linkId: "2.1",
          text: "Attachment",
          type: itemType.ATTATCHMENT,
          item: [{
            linkId: "2.1.1",
            text: "Attachment",
            type: itemType.ATTATCHMENT,
          }]
        }] as QuestionnaireItem[]
      }] as QuestionnaireItem[];

      const itemsWithType = getQuestionnaireItemsWithType(itemType.ATTATCHMENT, items);
      expect(itemsWithType).toEqual(expect.arrayContaining([expect.objectContaining({"linkId": "1"})]));
      expect(itemsWithType).toEqual(expect.arrayContaining([expect.objectContaining({"linkId": "2.1"})]));
      expect(itemsWithType).toEqual(expect.arrayContaining([expect.objectContaining({"linkId": "2.1.1"})]));      
    });
  });
});
