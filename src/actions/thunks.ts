import { createAsyncThunk } from '@reduxjs/toolkit';

import { runFhirPathQrUpdater } from '@/calculators/runFhirPathUpdater';
import { runScoringCalculator } from '@/calculators/runScoringCalculator';
import { AppDispatch, RootState } from '@/reducers';
import { ActionRequester } from '@/util/actionRequester';
import { FhirPathExtensions } from '@/util/FhirPathExtensions';
import { ScoringCalculator } from '@/util/scoringCalculator';

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

      await runScoringCalculator(questionnaire, questionnaireResponse, scoringActionRequester, new ScoringCalculator(questionnaire));

      scoringActionRequester.dispatchAllActions(dispatch);

      const updatedQuestionnaireResponse = getState().refero.form.FormData.Content;
      if (!updatedQuestionnaireResponse) {
        return rejectWithValue('Missing updated questionnaire response');
      }

      runFhirPathQrUpdater({
        questionnaire,
        questionnaireResponse: updatedQuestionnaireResponse,
        dispatch,
        fhirPathUpdater: new FhirPathExtensions(questionnaire),
      });
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);
