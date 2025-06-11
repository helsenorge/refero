import { createAsyncThunk } from '@reduxjs/toolkit';

import { runFhirPathQrUpdater } from '@/calculators/runFhirPathUpdater';
import { runScoringCalculator } from '@/calculators/runScoringCalculator';
import { AppDispatch, RootState } from '@/reducers';
import { ActionRequester } from '@/util/actionRequester';
import { ScoringCalculator } from '@/util/scoringCalculator';
import { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

const scoringCalculatorCache = new WeakMap<Questionnaire, ScoringCalculator>();

function getScoringCalculator(questionnaire: Questionnaire): ScoringCalculator {
  let calc = scoringCalculatorCache.get(questionnaire);
  if (!calc) {
    calc = new ScoringCalculator(questionnaire);
    scoringCalculatorCache.set(questionnaire, calc);
  }
  return calc;
}

export function debounce<T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}
const debouncedFhirPathRunner = debounce(
  (params: { questionnaire: Questionnaire; questionnaireResponse: QuestionnaireResponse; dispatch: AppDispatch }) => {
    runFhirPathQrUpdater(params);
  },
  200
);

export const runCalculatorsAction = createAsyncThunk<void, void, { state: RootState; dispatch: AppDispatch }>(
  'questionnaireResponse/update',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const state = getState();
    const questionnaire = state.refero.form.FormDefinition.Content;
    const questionnaireResponse = state.refero.form.FormData.Content;

    if (!questionnaire || !questionnaireResponse) {
      return rejectWithValue('Missing questionnaire or questionnaireResponse');
    }

    try {
      const scoringActionRequester = new ActionRequester(questionnaire, questionnaireResponse);

      await runScoringCalculator(questionnaire, questionnaireResponse, scoringActionRequester, getScoringCalculator(questionnaire));

      scoringActionRequester.dispatchAllActions(dispatch);

      const updatedQuestionnaireResponse = getState().refero.form.FormData.Content;
      if (!updatedQuestionnaireResponse) {
        return rejectWithValue('Missing updated questionnaire response');
      }
      debouncedFhirPathRunner({
        questionnaire,
        questionnaireResponse: updatedQuestionnaireResponse,
        dispatch,
      });
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);
