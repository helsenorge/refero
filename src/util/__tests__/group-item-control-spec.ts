import type { QuestionnaireItem } from 'fhir/r4';

import { Extensions } from '../../constants/extensions';
import itemControlConstants from '../../constants/itemcontrol';
import ItemType from '../../constants/itemType';
import { getGroupItemControl } from '../group-item-control';

describe('getGroupItemControl', () => {
  it('should return an empty array if item type is not GROUP', () => {
    const item: QuestionnaireItem = {
      linkId: '1',
      type: ItemType.ATTATCHMENT,
    };

    const result = getGroupItemControl(item);
    expect(result).toEqual([]);
  });

  it('should return an empty array if getItemControlExtensionValue returns undefined', () => {
    const item: QuestionnaireItem = {
      linkId: '1',
      type: ItemType.GROUP,
    };

    const result = getGroupItemControl(item);
    expect(result).toEqual([]);
  });

  it('should return an empty array if there are no valid item controls', () => {
    const item: QuestionnaireItem = {
      linkId: '1',
      type: ItemType.GROUP,
      extension: [
        {
          url: Extensions.ITEMCONTROL_URL,
          valueCodeableConcept: {
            coding: [{ code: 'invalid-code' }],
          },
        },
      ],
    };

    const result = getGroupItemControl(item);
    expect(result).toEqual([]);
  });

  it('should return valid item controls', () => {
    const validCode = Object.values(itemControlConstants.Group)[0];
    const item: QuestionnaireItem = {
      linkId: '1',
      type: ItemType.GROUP,
      extension: [
        {
          url: Extensions.ITEMCONTROL_URL,
          valueCodeableConcept: {
            coding: [{ code: validCode }],
          },
        },
      ],
    };

    const result = getGroupItemControl(item);
    expect(result).toEqual([{ code: validCode }]);
  });

  it('should filter out invalid item controls', () => {
    const validCode = Object.values(itemControlConstants.Group)[0];
    const item: QuestionnaireItem = {
      linkId: '1',
      type: ItemType.GROUP,
      extension: [
        {
          url: Extensions.ITEMCONTROL_URL,
          valueCodeableConcept: {
            coding: [{ code: validCode }, { code: 'invalid-code' }],
          },
        },
      ],
    };

    const result = getGroupItemControl(item);
    expect(result).toEqual([{ code: validCode }]);
  });
});
