import { QuestionnaireResponseItemAnswer, QuestionnaireItemEnableWhen, QuestionnaireItem, QuestionnaireResponse } from 'fhir/r4';
import { Mock, vi } from 'vitest';

import { extractValuesFromAnswer, getPrimitiveValueFromItemType, getQuestionnaireResponseItemAnswer, isConditionEnabled } from '../utils';
import * as questionnaireFunctions from '../utils';

import codeSystems from '@/constants/codingsystems';
import { Extensions } from '@/constants/extensions';
import ItemType from '@/constants/itemType';
import valueSet from '@/constants/valuesets';
import { QuestionnaireItemEnableBehaviorCodes } from '@/types/fhirEnums';
import * as fhirUtils from '@/util/refero-core';

vi.mock('@/util/refero-core');

describe('getPrimitiveValueFromItemType', () => {
  it('Should return value based on type', () => {
    const answer: QuestionnaireResponseItemAnswer = { valueString: 'test' };
    const response = getPrimitiveValueFromItemType(ItemType.TEXT, answer);
    expect(response).toEqual('test');
  });
});
describe('getQuestionnaireResponseItemAnswer', () => {
  it('Should return QuestionnaireResponseItemAnswer based on type and result', () => {
    // @ts-expect-error Testing invalid input
    const answer: never[] = ['test'];
    const response = getQuestionnaireResponseItemAnswer(ItemType.TEXT, answer);
    const expected: QuestionnaireResponseItemAnswer[] = [{ valueString: 'test' }];
    expect(response).toEqual(expected);
  });
});

// Mocks for dependent functions

describe('isConditionEnabled', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fhirUtils.getQuestionnaireResponseItemsWithLinkId as Mock).mockImplementation(() => [
      { linkId: 'e32a3b49-42df-4394-9560-2cf48155e182', text: 'Hvilken sykdom har du?', answer: [{ valueString: 'dfg' }] },
    ]);
    (fhirUtils.isInGroupContext as Mock).mockImplementation(() => true);
    (fhirUtils.enableWhenMatchesAnswer as Mock).mockImplementation(() => true);
  });

  it('should return true if single condition is met and behavior is ANY', () => {
    const conditions: QuestionnaireItemEnableWhen[] = [
      { answerBoolean: true, question: 'e32a3b49-42df-4394-9560-2cf48155e182', operator: 'exists' },
    ];

    const behavior = QuestionnaireItemEnableBehaviorCodes.ANY;
    const currentPath: fhirUtils.Path[] = [];
    const responseItems = [
      {
        linkId: '4233cb23-aff4-4e72-8c89-41cdc44f8939',
        text: 'Personalia',
        item: [
          { linkId: '855afb10-1dd5-46d4-ab56-d8b8587323a4', text: 'Hva heter du?', answer: [{ valueString: 'sdf' }] },
          { linkId: '314166c1-cb72-4c67-b0a9-d90581d658ad', text: 'Hvor gammel er du?', answer: [{ valueString: 'sdf' }] },
        ],
      },
      {
        linkId: 'f6764114-86d9-402d-8e05-aca25f980f5f',
        text: 'Sykdommer',
        item: [
          { linkId: '3cf13e1a-a775-42cc-8182-babde16743aa', text: 'Har du hjertesykdom?', answer: [{ valueString: 'dfgd' }] },
          { linkId: 'e32a3b49-42df-4394-9560-2cf48155e182', text: 'Hvilken sykdom har du?', answer: [{ valueString: 'dfg' }] },
          { linkId: '8caedfdb-dee1-47eb-8ee0-9c451fb4fb57', text: 'Kan du si litt mer om sykdommen din?' },
        ],
      },
      {
        linkId: '2e71aeb8-aa1c-4bc4-b3a9-b82ed16acc28',
        text: 'Oppsummering',
        item: [
          {
            linkId: '2f566ffe-3f0c-4b3b-8b55-bdcb8aaea08b',
            text: 'Oppsummering Table-HN1',
            item: [
              {
                linkId: 'b0c00973-36bd-49ad-92cf-887bbcf6f9b6',
                text: 'Personalia',
                item: [
                  { linkId: 'fd70929b-7421-4f59-8c0d-d86366d260c7', text: 'Hva heter du?' },
                  { linkId: '5a85ef28-51a0-45d7-899f-c87f7384a03e', text: 'Hvor gammel er du?' },
                ],
              },
              {
                linkId: '765cc891-f702-4361-8a5f-719bcb26ec34',
                text: 'Sykdommer',
                item: [
                  { linkId: '0388ed83-02a8-4660-80e3-d05208bb1dea', text: 'Har du hjertesykdom?' },
                  { linkId: 'de1df328-4b5d-4831-90c0-e2fd7993067a', text: 'Hvilken sykdom har du?' },
                  { linkId: '7789abe2-0594-4896-d930-e271972d13cd', text: 'Kan du si litt mer om sykdommen din?' },
                ],
              },
            ],
          },
        ],
      },
    ];

    const result = isConditionEnabled(conditions, behavior, currentPath, responseItems);
    expect(result).toBe(true);
  });
});

describe('extractValuesFromAnswer', () => {
  // Test for single answer
  it('should extract value from a single answer correctly', () => {
    const type = ItemType.STRING;
    const singleAnswer: QuestionnaireResponseItemAnswer = { valueString: 'Test Answer' };

    const result = extractValuesFromAnswer(type, singleAnswer);

    expect(result).toEqual(['Test Answer']);
  });

  it('should extract values from an array of answers correctly', () => {
    const type = ItemType.INTEGER; // Another example type
    const arrayOfAnswers: QuestionnaireResponseItemAnswer[] = [{ valueInteger: 1 }, { valueInteger: 2 }];

    const result = extractValuesFromAnswer(type, arrayOfAnswers);

    expect(result).toEqual([1, 2]);
  });

  it('should return an empty array if questionnaireAnswer is undefined', () => {
    const type = ItemType.STRING; // Example type

    const result = extractValuesFromAnswer(type, undefined);

    expect(result).toEqual([]);
  });
  it('should extract string value correctly', () => {
    const type = ItemType.STRING;
    const singleAnswer: QuestionnaireResponseItemAnswer = { valueString: 'Test String' };

    const result = extractValuesFromAnswer(type, singleAnswer);

    expect(result).toEqual(['Test String']);
  });

  it('should extract integer values from an array of answers correctly', () => {
    const type = ItemType.INTEGER;
    const arrayOfAnswers: QuestionnaireResponseItemAnswer[] = [{ valueInteger: 1 }, { valueInteger: 2 }];

    const result = extractValuesFromAnswer(type, arrayOfAnswers);

    expect(result).toEqual([1, 2]);
  });

  it('should extract boolean values correctly', () => {
    const type = ItemType.BOOLEAN;
    const singleAnswer: QuestionnaireResponseItemAnswer = { valueBoolean: true };

    const result = extractValuesFromAnswer(type, singleAnswer);

    expect(result).toEqual(['[X]']);
  });

  it('should extract choice value correctly', () => {
    const type = ItemType.CHOICE;
    const singleAnswer: QuestionnaireResponseItemAnswer = { valueCoding: { display: 'Choice1' } };

    const result = extractValuesFromAnswer(type, singleAnswer);

    expect(result).toEqual(['Choice1']);
  });

  it('should return an empty array if questionnaireAnswer is undefined', () => {
    const type = ItemType.STRING;

    const result = extractValuesFromAnswer(type, undefined);

    expect(result).toEqual([]);
  });
});

describe('addAnswerToItems', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should process single item correctly', async () => {
    const mockItem: QuestionnaireItem = {
      linkId: '1',
      text: 'How are you feeling today?',
      type: ItemType.STRING,
      extension: [
        {
          url: Extensions.COPY_EXPRESSION_URL,
          valueString: "QuestionnaireResponse.descendants().where(linkId='1').answer.value",
        },
        {
          url: Extensions.ITEMCONTROL_URL,
          valueCodeableConcept: {
            coding: [
              {
                code: 'data-receiver',
                system: valueSet.QUESTIONNAIRE_ITEM_CONTROL_SYSTEM,
              },
            ],
          },
        },
      ],
    };
    const mockResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      item: [
        {
          linkId: '1',
          answer: [
            {
              valueString: 'I feel good.',
            },
          ],
        },
      ],
    };

    const result = await questionnaireFunctions.addAnswerToItems([mockItem], mockResponse);

    expect(result[0].answer).toEqual([{ valueString: 'I feel good.' }]);
  });

  it('should handle an array of answers correctly', async () => {
    const mockItem: QuestionnaireItem = {
      linkId: '1',
      text: 'How are you feeling today?',
      type: ItemType.STRING,
      extension: [
        {
          url: Extensions.COPY_EXPRESSION_URL,
          valueString: "QuestionnaireResponse.descendants().where(linkId='1').answer.value",
        },
        {
          url: Extensions.ITEMCONTROL_URL,
          valueCodeableConcept: {
            coding: [
              {
                code: 'data-receiver',
                system: valueSet.QUESTIONNAIRE_ITEM_CONTROL_SYSTEM,
              },
            ],
          },
        },
      ],
    };
    const mockResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      item: [
        {
          linkId: '1',
          answer: [{ valueString: 'First Answer' }, { valueString: 'Second Answer' }],
        },
      ],
    };

    const result = await questionnaireFunctions.addAnswerToItems([mockItem], mockResponse);

    expect(result[0].answer).toEqual([{ valueString: 'First Answer' }, { valueString: 'Second Answer' }]);
  });

  it('should return empty answer array when getValueIfDataReceiver returns undefined', async () => {
    const mockItem: QuestionnaireItem = {
      linkId: '1',
      text: 'How are you feeling today?',
      type: ItemType.STRING,
      extension: [
        {
          url: Extensions.COPY_EXPRESSION_URL,
          valueString: "QuestionnaireResponse.descendants().where(linkId='1').answer.value",
        },
        {
          url: Extensions.ITEMCONTROL_URL,
          valueCodeableConcept: {
            coding: [
              {
                code: 'data-receiver',
                system: valueSet.QUESTIONNAIRE_ITEM_CONTROL_SYSTEM,
              },
            ],
          },
        },
      ],
    };
    const mockResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      item: [
        {
          linkId: '2',
          answer: [{ valueString: 'First Answer' }, { valueString: 'Second Answer' }],
        },
      ],
    };

    const result = await questionnaireFunctions.addAnswerToItems([mockItem], mockResponse);

    expect(result[0].answer).toEqual([]);
  });
});

describe('findIndexByCode', () => {
  it('should return index of item with given code', () => {
    const item: QuestionnaireItem = {
      linkId: '1',
      text: 'How are you feeling today?',
      type: ItemType.STRING,
      code: [
        {
          system: codeSystems.TableColumn,
          code: '1',
          display: 'Column 1',
        },
      ],
    };

    const result = questionnaireFunctions.findIndexByCode(item, codeSystems.TableColumn);

    expect(result).toEqual(1);
  });
  it('should return -1 if not found', () => {
    const item: QuestionnaireItem = {
      linkId: '1',
      text: 'How are you feeling today?',
      type: ItemType.STRING,
      code: [],
    };

    const result = questionnaireFunctions.findIndexByCode(item, codeSystems.TableColumn);

    expect(result).toEqual(-1);
  });
});
