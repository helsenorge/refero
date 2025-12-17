import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { AppDispatch } from '@/reducers';
import type { ActionRequester } from '@/util/actionRequester';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

import { runFhirPathQrUpdater } from '../runFhirPathUpdater';

import { newAnswerValuesAction } from '@/actions/newValue';
import ItemType from '@/constants/itemType';

vi.unmock('@/workers/worker-factory');

vi.mock('@/actions/newValue', () => ({
  newAnswerValuesAction: vi.fn(payload => ({ type: 'NEW_ANSWER_VALUES', payload })),
}));

describe('runFhirPathQrUpdater with real inline worker via factory', () => {
  let mockDispatch: AppDispatch;
  let mockActionRequester: ActionRequester;

  beforeEach(() => {
    mockActionRequester = {
      setNewAnswer: vi.fn(),
      dispatchAllActions: vi.fn(),
    } as unknown as ActionRequester;
    mockDispatch = vi.fn();

    vi.clearAllMocks();
  });

  it('should return early if questionnaire is missing', async () => {
    await runFhirPathQrUpdater({
      questionnaire: null as Questionnaire | null,
      questionnaireResponse: { resourceType: 'QuestionnaireResponse', status: 'in-progress' },
      dispatch: mockDispatch,
    });
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('should calculate expression and dispatch newAnswerValuesAction', async () => {
    const mockQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft',
      item: [
        { linkId: 'input', type: ItemType.INTEGER },
        {
          linkId: 'calculated',
          type: ItemType.INTEGER,
          extension: [
            {
              url: 'http://ehelse.no/fhir/StructureDefinition/sdf-calculatedExpression',
              valueString: "QuestionnaireResponse.descendants().where(linkId='input').answer.value",
            },
          ],
        },
      ],
    };
    const mockQuestionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      item: [{ linkId: 'input', answer: [{ valueInteger: 42 }] }, { linkId: 'calculated' }],
    };

    await runFhirPathQrUpdater({
      questionnaire: mockQuestionnaire,
      questionnaireResponse: mockQuestionnaireResponse,
      dispatch: mockDispatch,
    });

    await vi.waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled();
    });

    expect(newAnswerValuesAction).toHaveBeenCalledWith([
      expect.objectContaining({
        item: expect.objectContaining({ linkId: 'calculated' }),
        newAnswer: [{ valueInteger: 42 }],
        itemPath: expect.any(Array),
      }),
    ]);
  });

  it('should use actionRequester to set new answers if provided', async () => {
    const mockQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft',
      item: [
        { linkId: 'input1', type: ItemType.INTEGER },
        { linkId: 'input2', type: ItemType.INTEGER },
        {
          linkId: 'sum',
          type: ItemType.INTEGER,
          extension: [
            {
              url: 'http://ehelse.no/fhir/StructureDefinition/sdf-calculatedExpression',
              valueString:
                "QuestionnaireResponse.descendants().where(linkId='input1').answer.value + QuestionnaireResponse.descendants().where(linkId='input2').answer.value",
            },
          ],
        },
      ],
    };
    const mockQuestionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      item: [{ linkId: 'input1', answer: [{ valueInteger: 10 }] }, { linkId: 'input2', answer: [{ valueInteger: 20 }] }, { linkId: 'sum' }],
    };

    await runFhirPathQrUpdater({
      questionnaire: mockQuestionnaire,
      questionnaireResponse: mockQuestionnaireResponse,
      dispatch: mockDispatch,
      actionRequester: mockActionRequester,
    });

    await vi.waitFor(() => {
      expect(mockActionRequester.setNewAnswer).toHaveBeenCalled();
    });

    expect(mockActionRequester.setNewAnswer).toHaveBeenCalledWith('sum', [{ valueInteger: 30 }], expect.any(Number));
    expect(mockActionRequester.dispatchAllActions).toHaveBeenCalledWith(mockDispatch);
  });

  it('should not update if the calculated value is the same as the existing answer', async () => {
    const mockQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft',
      item: [
        { linkId: 'input', type: ItemType.INTEGER },
        {
          linkId: 'calculated',
          type: ItemType.INTEGER,
          extension: [
            {
              url: 'http://ehelse.no/fhir/StructureDefinition/sdf-calculatedExpression',
              valueString: "QuestionnaireResponse.descendants().where(linkId='input').answer.value",
            },
          ],
        },
      ],
    };
    const mockQuestionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      item: [
        { linkId: 'input', answer: [{ valueInteger: 42 }] },
        { linkId: 'calculated', answer: [{ valueInteger: 42 }] },
      ],
    };

    await runFhirPathQrUpdater({
      questionnaire: mockQuestionnaire,
      questionnaireResponse: mockQuestionnaireResponse,
      dispatch: mockDispatch,
    });

    await new Promise(resolve => setTimeout(resolve, 200));

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockActionRequester.setNewAnswer).not.toHaveBeenCalled();
  });
});
