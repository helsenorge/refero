import { createAsyncThunk } from '@reduxjs/toolkit';
import { Questionnaire } from 'fhir/r4';

import { resetAnswerValueAsync } from './newValue';

import { startEnableWhenCalculation } from '@/calculators/runEnableWhen_new';
import { runFhirPathQrUpdater } from '@/calculators/runFhirPathUpdater';
import { runScoringCalculator } from '@/calculators/runScoringCalculator';
import { AppDispatch, RootState } from '@/reducers';
import { ActionRequester } from '@/util/actionRequester';
import { debounce } from '@/util/debounce';
import { ScoringCalculator } from '@/util/scoringCalculator';

const scoringCalculatorCache = new WeakMap<Questionnaire, ScoringCalculator>();

function getScoringCalculator(questionnaire: Questionnaire): ScoringCalculator {
  let calc = scoringCalculatorCache.get(questionnaire);
  if (!calc) {
    calc = new ScoringCalculator(questionnaire);
    scoringCalculatorCache.set(questionnaire, calc);
  }
  return calc;
}

const debouncedFhirPathRunner = debounce(async (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState();
  const questionnaire = state.refero.form.FormDefinition.Content;
  const questionnaireResponse = state.refero.form.FormData.Content;
  if (questionnaire && questionnaireResponse) {
    await runFhirPathQrUpdater({ questionnaire, questionnaireResponse, dispatch });
  }
}, 120);

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
      debouncedFhirPathRunner(dispatch, getState);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const runEnableWhenAction = createAsyncThunk<void, void, { state: RootState; dispatch: AppDispatch }>(
  'questionnaireResponse/runEnableWhen',
  async (_, { getState, rejectWithValue, dispatch }) => {
    const {
      refero: {
        form: { FormDefinition, FormData },
      },
    } = getState();
    const questionnaire = FormDefinition.Content;
    const questionnaireResponse = FormData.Content;

    if (!questionnaire || !questionnaireResponse) {
      return rejectWithValue('Missing questionnaire or questionnaireResponse');
    }

    try {
      const actions = await startEnableWhenCalculation({ questionnaire, questionnaireResponse });
      if (actions.length === 0) {
        return;
      }
      await dispatch(resetAnswerValueAsync(actions));
      dispatch(runEnableWhenAction());
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);
