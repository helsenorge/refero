import { describe, expect, vi, beforeEach } from 'vitest';

import type { ActionRequester } from '@/util/actionRequester';
import type { ScoringCalculator } from '@/util/scoringCalculator';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

import { questionnaireHasScoring, runScoringCalculator, updateQuestionnaireResponseWithScore } from '../runScoringCalculator';

import ItemType from '@/constants/itemType';
import * as extensionUtil from '@/util/extension';
import * as valueUtil from '@/util/index';
import * as referoCore from '@/util/refero-core';

describe('runScoringCalculator', () => {
  let questionnaire: Questionnaire;
  let questionnaireResponse: QuestionnaireResponse;
  let actionRequester: ActionRequester;
  let scoringCalculator: ScoringCalculator;
  let mockScores: Record<string, number>;

  beforeEach(() => {
    questionnaire = { item: [], resourceType: 'Questionnaire', status: 'draft' } as Questionnaire;
    questionnaireResponse = { item: [], resourceType: 'QuestionnaireResponse', status: 'in-progress' } as QuestionnaireResponse;
    mockScores = { 'score-item-1': 10 };

    actionRequester = {
      addManyActions: vi.fn(),
    } as unknown as ActionRequester;

    scoringCalculator = {
      calculateScore: vi.fn().mockReturnValue(mockScores),
      getIsScoringQuestionnaire: vi.fn().mockReturnValue(true),
    } as unknown as ScoringCalculator;

    vi.spyOn(referoCore, 'getQuestionnaireDefinitionItem').mockImplementation(linkId => ({
      linkId,
      type: ItemType.INTEGER,
    }));

    vi.spyOn(referoCore, 'getResponseItemAndPathWithLinkId').mockImplementation(() => [
      {
        item: { linkId: 'score-item-1' },
        path: [{ linkId: 'score-item-1', index: 0 }],
      },
    ]);

    vi.spyOn(valueUtil, 'getDecimalValue').mockReturnValue(10);
  });

  it('should return empty array if any required parameter is missing', async () => {
    expect(await runScoringCalculator(undefined, questionnaireResponse, actionRequester, scoringCalculator)).toEqual([]);
    expect(await runScoringCalculator(questionnaire, undefined, actionRequester, scoringCalculator)).toEqual([]);
    expect(await runScoringCalculator(questionnaire, questionnaireResponse, undefined, scoringCalculator)).toEqual([]);
    expect(await runScoringCalculator(questionnaire, questionnaireResponse, actionRequester, undefined)).toEqual([]);
  });

  it('should return empty array if questionnaire does not have scoring', async () => {
    vi.spyOn(scoringCalculator, 'getIsScoringQuestionnaire').mockReturnValue(false);
    expect(await runScoringCalculator(questionnaire, questionnaireResponse, actionRequester, scoringCalculator)).toEqual([]);
  });

  it('should calculate scores and update questionnaire response', async () => {
    const result = await runScoringCalculator(questionnaire, questionnaireResponse, actionRequester, scoringCalculator);

    expect(scoringCalculator.calculateScore).toHaveBeenCalledWith(questionnaireResponse);
    expect(actionRequester.addManyActions).toHaveBeenCalled();
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('updateQuestionnaireResponseWithScore', () => {
  let questionnaire: Questionnaire;
  let questionnaireResponse: QuestionnaireResponse;
  let actionRequester: ActionRequester;
  let scores: Record<string, number>;

  beforeEach(() => {
    questionnaire = { item: [], resourceType: 'Questionnaire', status: 'draft' } as Questionnaire;
    questionnaireResponse = { item: [], resourceType: 'QuestionnaireResponse', status: 'in-progress' } as QuestionnaireResponse;
    scores = { 'quantity-item': 10, 'decimal-item': 5.5, 'integer-item': 3 };

    actionRequester = {
      addManyActions: vi.fn(),
    } as unknown as ActionRequester;

    vi.spyOn(referoCore, 'getQuestionnaireDefinitionItem').mockImplementation(linkId => {
      if (linkId === 'quantity-item') {
        return { linkId, type: ItemType.QUANTITY };
      } else if (linkId === 'decimal-item') {
        return { linkId, type: ItemType.DECIMAL };
      } else {
        return { linkId, type: ItemType.INTEGER };
      }
    });

    vi.spyOn(referoCore, 'getResponseItemAndPathWithLinkId').mockImplementation(() => [
      {
        item: {
          linkId: 'quantity-item',
        },
        path: [{ linkId: 'quantity-item', index: 0 }],
      },
    ]);

    vi.spyOn(extensionUtil, 'getQuestionnaireUnitExtensionValue').mockReturnValue({
      system: 'test-system',
      code: 'test-code',
      display: 'Test Unit',
    });

    vi.spyOn(valueUtil, 'getDecimalValue').mockReturnValue(10);
  });

  it('should handle quantity items correctly', () => {
    const result = updateQuestionnaireResponseWithScore(scores, questionnaire, questionnaireResponse, actionRequester);

    expect(
      result.some(action => action.payload && 'valueQuantity' in action.payload && action.payload?.valueQuantity?.unit === 'Test Unit')
    ).toBeTruthy();
  });

  it('should handle decimal items correctly', () => {
    const result = updateQuestionnaireResponseWithScore(scores, questionnaire, questionnaireResponse, actionRequester);

    expect(result.some(action => action.payload && 'valueDecimal' in action.payload)).toBeTruthy();
  });

  it('should handle integer items correctly', () => {
    const result = updateQuestionnaireResponseWithScore(scores, questionnaire, questionnaireResponse, actionRequester);

    expect(result.some(action => action.payload && 'valueInteger' in action.payload)).toBeTruthy();
  });

  it('should add actions to the actionRequester', () => {
    updateQuestionnaireResponseWithScore(scores, questionnaire, questionnaireResponse, actionRequester);
    expect(actionRequester.addManyActions).toHaveBeenCalled();
  });
});

describe('questionnaireHasScoring', () => {
  it('should return false if scoringCalculator is undefined', () => {
    expect(questionnaireHasScoring(undefined)).toBe(false);
  });

  it('should return false if getIsScoringQuestionnaire returns false', () => {
    const scoringCalculator = {
      getIsScoringQuestionnaire: vi.fn().mockReturnValue(false),
    } as unknown as ScoringCalculator;

    expect(questionnaireHasScoring(scoringCalculator)).toBe(false);
  });

  it('should return true if getIsScoringQuestionnaire returns true', () => {
    const scoringCalculator = {
      getIsScoringQuestionnaire: vi.fn().mockReturnValue(true),
    } as unknown as ScoringCalculator;

    expect(questionnaireHasScoring(scoringCalculator)).toBe(true);
  });
});
