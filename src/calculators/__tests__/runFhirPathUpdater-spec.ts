import { Coding, Questionnaire, QuestionnaireItem, QuestionnaireResponse } from 'fhir/r4';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { runFhirPathQrUpdater } from '../runFhirPathUpdater';

import { newAnswerValueAction } from '@/actions/newValue';
import ItemType from '@/constants/itemType';
import { AppDispatch } from '@/reducers';
import * as utils from '@/util';
import { ActionRequester } from '@/util/actionRequester';
import * as extensionUtils from '@/util/extension';
import { AnswerPad, FhirPathExtensions } from '@/util/FhirPathExtensions';
import * as referoCore from '@/util/refero-core';

vi.mock('@/actions/newValue');
vi.mock('@/util/extension');
vi.mock('@/util/refero-core');
vi.mock('@/util');

describe('runFhirPathQrUpdater', () => {
  let mockDispatch: AppDispatch;
  let mockFhirPathUpdater: FhirPathExtensions;
  let mockQuestionnaire: Questionnaire;
  let mockQuestionnaireResponse: QuestionnaireResponse;
  let mockActionRequester: ActionRequester;

  beforeEach(() => {
    mockDispatch = vi.fn();
    mockFhirPathUpdater = {
      evaluateAllExpressions: vi.fn(),
      calculateFhirScore: vi.fn(),
    } as unknown as FhirPathExtensions;

    mockQuestionnaire = { item: [], resourceType: 'Questionnaire', status: 'draft' };
    mockQuestionnaireResponse = { item: [], resourceType: 'QuestionnaireResponse', status: 'in-progress' };
    mockActionRequester = {
      addQuantityAnswer: vi.fn(),
      addDecimalAnswer: vi.fn(),
      addIntegerAnswer: vi.fn(),
      addBooleanAnswer: vi.fn(),
      addStringAnswer: vi.fn(),
      addChoiceAnswer: vi.fn(),
      addOpenChoiceAnswer: vi.fn(),
      addDateTimeAnswer: vi.fn(),
      addDateAnswer: vi.fn(),
      addTimeAnswer: vi.fn(),
      setNewAnswer: vi.fn(),
      isCheckbox: vi.fn(),
      dispatchAllActions: vi.fn(),
    } as unknown as ActionRequester;

    vi.clearAllMocks();
  });

  it('should return early if any required parameters are missing', async () => {
    await runFhirPathQrUpdater({
      questionnaire: null as unknown as Questionnaire,
      questionnaireResponse: mockQuestionnaireResponse,
      dispatch: mockDispatch,
      fhirPathUpdater: mockFhirPathUpdater,
    });

    expect(mockFhirPathUpdater.evaluateAllExpressions).not.toHaveBeenCalled();
  });

  it('should evaluate expressions and update the response', async () => {
    const updatedResponse = { resourceType: 'QuestionnaireResponse' } as QuestionnaireResponse;
    const scores: AnswerPad = { 'test-item': [{ valueInteger: 10 }] };

    mockFhirPathUpdater.evaluateAllExpressions = vi.fn().mockReturnValue(updatedResponse);
    mockFhirPathUpdater.calculateFhirScore = vi.fn().mockReturnValue(scores);

    const mockItem: QuestionnaireItem = { linkId: 'test-item', type: ItemType.INTEGER };
    vi.mocked(referoCore.getQuestionnaireDefinitionItem).mockReturnValue(mockItem);
    vi.mocked(referoCore.getResponseItemAndPathWithLinkId).mockReturnValue([
      {
        item: { linkId: 'test-item' },
        path: [{ linkId: 'test-item', index: 0 }],
      },
    ]);

    await runFhirPathQrUpdater({
      questionnaire: mockQuestionnaire,
      questionnaireResponse: mockQuestionnaireResponse,
      dispatch: mockDispatch,
      fhirPathUpdater: mockFhirPathUpdater,
    });

    expect(mockFhirPathUpdater.evaluateAllExpressions).toHaveBeenCalledWith(mockQuestionnaireResponse);
    expect(mockFhirPathUpdater.calculateFhirScore).toHaveBeenCalledWith(updatedResponse);
    expect(referoCore.getQuestionnaireDefinitionItem).toHaveBeenCalledWith('test-item', mockQuestionnaire.item);
    expect(referoCore.getResponseItemAndPathWithLinkId).toHaveBeenCalledWith('test-item', {
      ...updatedResponse,
      item: [],
      status: 'in-progress',
    });
    expect(mockDispatch).toHaveBeenCalledWith(newAnswerValueAction(expect.any(Object)));
  });

  it('should handle quantity type items', async () => {
    const scores: AnswerPad = {
      'quantity-item': [
        {
          valueQuantity: {
            unit: 'Test Unit',
            system: 'test-system',
            code: 'test-code',
            value: 42,
          },
        },
      ],
    };
    const mockExtension: Coding = {
      system: 'test-system',
      code: 'test-code',
      display: 'Test Unit',
    };
    const mockItem: QuestionnaireItem = { linkId: 'quantity-item', type: ItemType.QUANTITY };

    mockFhirPathUpdater.evaluateAllExpressions = vi.fn().mockReturnValue(mockQuestionnaireResponse);
    mockFhirPathUpdater.calculateFhirScore = vi.fn().mockReturnValue(scores);

    vi.mocked(referoCore.getQuestionnaireDefinitionItem).mockReturnValue(mockItem);
    vi.mocked(extensionUtils.getQuestionnaireUnitExtensionValue).mockReturnValue(mockExtension);
    vi.mocked(referoCore.getResponseItemAndPathWithLinkId).mockReturnValue([
      {
        item: { linkId: 'quantity-item' },
        path: [{ linkId: 'quantity-item', index: 0 }],
      },
    ]);
    vi.mocked(utils.getDecimalValue).mockReturnValue(42);

    await runFhirPathQrUpdater({
      questionnaire: mockQuestionnaire,
      questionnaireResponse: mockQuestionnaireResponse,
      dispatch: mockDispatch,
      actionRequester: mockActionRequester,
      fhirPathUpdater: mockFhirPathUpdater,
    });

    expect(mockActionRequester.setNewAnswer).toHaveBeenCalledWith(
      'quantity-item',
      expect.objectContaining([
        {
          valueQuantity: {
            unit: 'Test Unit',
            system: 'test-system',
            code: 'test-code',
            value: 42,
          },
        },
      ]),
      0
    );
  });

  it('should handle different item types with actionRequester', async () => {
    const scores: AnswerPad = {
      'decimal-item': [{ valueDecimal: 10.5 }],
      'integer-item': [{ valueInteger: 42 }],
      'boolean-item': [{ valueBoolean: true }],
      'string-item': [{ valueString: 'test' }],
      'choice-item': [{ valueCoding: { system: 'test', code: 'code', display: 'Test Coding' } }],
      'openchoice-item': [{ valueString: 'open value' }],
      'datetime-item': [{ valueDateTime: '2023-01-01T12:00:00' }],
      'date-item': [{ valueDate: '2023-01-01' }],
      'time-item': [{ valueTime: '12:00:00' }],
    };

    mockFhirPathUpdater.evaluateAllExpressions = vi.fn().mockReturnValue(mockQuestionnaireResponse);
    mockFhirPathUpdater.calculateFhirScore = vi.fn().mockReturnValue(scores);

    const mockPath = [{ linkId: '', index: 0 }];

    // Mock different item types
    vi.mocked(referoCore.getQuestionnaireDefinitionItem).mockImplementation(linkId => {
      const typeMap: Record<string, string> = {
        'decimal-item': ItemType.DECIMAL,
        'integer-item': ItemType.INTEGER,
        'boolean-item': ItemType.BOOLEAN,
        'string-item': ItemType.STRING,
        'choice-item': ItemType.CHOICE,
        'openchoice-item': ItemType.OPENCHOICE,
        'datetime-item': ItemType.DATETIME,
        'date-item': ItemType.DATE,
        'time-item': ItemType.TIME,
      };

      return { linkId, type: typeMap[linkId] } as QuestionnaireItem;
    });

    vi.mocked(referoCore.getResponseItemAndPathWithLinkId).mockImplementation(linkId => [
      {
        item: { linkId },
        path: mockPath,
      },
    ]);

    vi.mocked(utils.getDecimalValue).mockReturnValue(10.5);

    await runFhirPathQrUpdater({
      questionnaire: mockQuestionnaire,
      questionnaireResponse: mockQuestionnaireResponse,
      dispatch: mockDispatch,
      actionRequester: mockActionRequester,
      fhirPathUpdater: mockFhirPathUpdater,
    });

    expect(mockActionRequester.setNewAnswer).toHaveBeenCalledWith('decimal-item', [{ valueDecimal: 10.5 }], 0);
    expect(mockActionRequester.setNewAnswer).toHaveBeenCalledWith('integer-item', [{ valueInteger: 42 }], 0);
    expect(mockActionRequester.setNewAnswer).toHaveBeenCalledWith('boolean-item', [{ valueBoolean: true }], 0);
    expect(mockActionRequester.setNewAnswer).toHaveBeenCalledWith('string-item', [{ valueString: 'test' }], 0);
    expect(mockActionRequester.setNewAnswer).toHaveBeenCalledWith(
      'choice-item',
      [{ valueCoding: { system: 'test', code: 'code', display: 'Test Coding' } }],
      0
    );
    expect(mockActionRequester.setNewAnswer).toHaveBeenCalledWith('openchoice-item', [{ valueString: 'open value' }], 0);
    expect(mockActionRequester.setNewAnswer).toHaveBeenCalledWith('datetime-item', [{ valueDateTime: '2023-01-01T12:00:00' }], 0);
    expect(mockActionRequester.setNewAnswer).toHaveBeenCalledWith('date-item', [{ valueDate: '2023-01-01' }], 0);
    expect(mockActionRequester.setNewAnswer).toHaveBeenCalledWith('time-item', [{ valueTime: '12:00:00' }], 0);
  });

  it('should handle checkbox items for choice type', async () => {
    const scores: AnswerPad = {
      'checkbox-item': [
        {
          valueCoding: { system: 'test', code: 'code1', display: 'Option 1' },
        },
        { valueCoding: { system: 'test', code: 'code2', display: 'Option 2' } },
      ],
    };

    const mockItem: QuestionnaireItem = { linkId: 'checkbox-item', type: ItemType.CHOICE };

    mockFhirPathUpdater.evaluateAllExpressions = vi.fn().mockReturnValue(mockQuestionnaireResponse);
    mockFhirPathUpdater.calculateFhirScore = vi.fn().mockReturnValue(scores);

    vi.mocked(referoCore.getQuestionnaireDefinitionItem).mockReturnValue(mockItem);
    vi.mocked(referoCore.getResponseItemAndPathWithLinkId).mockReturnValue([
      {
        item: { linkId: 'checkbox-item' },
        path: [{ linkId: 'checkbox-item', index: 0 }],
      },
    ]);

    await runFhirPathQrUpdater({
      questionnaire: mockQuestionnaire,
      questionnaireResponse: mockQuestionnaireResponse,
      dispatch: mockDispatch,
      actionRequester: mockActionRequester,
      fhirPathUpdater: mockFhirPathUpdater,
    });

    expect(mockActionRequester.setNewAnswer).toHaveBeenCalledWith(
      'checkbox-item',
      expect.arrayContaining([
        { valueCoding: { code: 'code1', display: 'Option 1', system: 'test' } },
        { valueCoding: { code: 'code2', display: 'Option 2', system: 'test' } },
      ]),
      0
    );
  });
});
