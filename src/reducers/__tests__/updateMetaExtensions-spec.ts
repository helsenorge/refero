import '../../util/__tests__/defineFetch';

import type { Extension } from 'fhir/r4';

import { store as createStore } from '..';
import { actions, initialState, type Form } from '../form';

const UISTATE_URL = 'https://helsenorge.no/fhir/StructureDefinition/questionnaireresponse-uiState';
const STEP_INDEX_URL = 'pageStepIndex';
const UPDATED_AT_URL = 'updatedAt';
const OTHER_EXT_URL = 'http://example.com/other-extension';

function createStateWithContent(meta?: { extension?: Extension[] }): Form {
  return {
    ...initialState,
    FormData: {
      Content: {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        meta: meta,
      },
    },
  };
}

function dispatchUpdateMetaExtensions(state: Form, extensions: Extension[]): Form {
  const reduxStore = createStore(state);
  reduxStore.dispatch(actions.updateQuestionnaireResponseMetaExtensions({ extension: extensions }));
  return reduxStore.getState().refero.form;
}

describe('updateQuestionnaireResponseMetaExtensions reducer', () => {
  describe('when FormData.Content is null', () => {
    it('should not modify state', () => {
      const state: Form = { ...initialState, FormData: { Content: null } };
      const newState = dispatchUpdateMetaExtensions(state, [{ url: UISTATE_URL }]);
      expect(newState.FormData.Content).toBeNull();
    });
  });

  describe('when FormData.Content exists but has no meta', () => {
    it('should create meta and add extensions', () => {
      const state = createStateWithContent(undefined);
      const extension: Extension = {
        url: UISTATE_URL,
        extension: [{ url: STEP_INDEX_URL, valueCode: '0' }],
      };
      const newState = dispatchUpdateMetaExtensions(state, [extension]);

      expect(newState.FormData.Content?.meta).toBeDefined();
      expect(newState.FormData.Content?.meta?.extension).toHaveLength(1);
      expect(newState.FormData.Content?.meta?.extension?.[0].url).toBe(UISTATE_URL);
    });
  });

  describe('when meta exists but has no extensions', () => {
    it('should create the extension array and add extensions', () => {
      const state = createStateWithContent({});
      const extension: Extension = {
        url: UISTATE_URL,
        extension: [{ url: STEP_INDEX_URL, valueCode: '1' }],
      };
      const newState = dispatchUpdateMetaExtensions(state, [extension]);

      expect(newState.FormData.Content?.meta?.extension).toHaveLength(1);
      expect(newState.FormData.Content?.meta?.extension?.[0]).toEqual(extension);
    });
  });

  describe('when payload has no extensions', () => {
    it('should not modify existing extensions when payload extension is undefined', () => {
      const existingExtension: Extension = { url: OTHER_EXT_URL, valueString: 'keep-me' };
      const state = createStateWithContent({ extension: [existingExtension] });

      const reduxStore = createStore(state);
      reduxStore.dispatch(actions.updateQuestionnaireResponseMetaExtensions({}));
      const newState = reduxStore.getState().refero.form;

      expect(newState.FormData.Content?.meta?.extension).toHaveLength(1);
      expect(newState.FormData.Content?.meta?.extension?.[0]).toEqual(existingExtension);
    });
  });

  describe('upsert behavior - matching by URL', () => {
    it('should add a new extension when no matching URL exists', () => {
      const existingExtension: Extension = { url: OTHER_EXT_URL, valueString: 'existing' };
      const state = createStateWithContent({ extension: [existingExtension] });

      const newExtension: Extension = {
        url: UISTATE_URL,
        extension: [{ url: STEP_INDEX_URL, valueCode: '0' }],
      };
      const newState = dispatchUpdateMetaExtensions(state, [newExtension]);

      expect(newState.FormData.Content?.meta?.extension).toHaveLength(2);
      expect(newState.FormData.Content?.meta?.extension?.[0]).toEqual(existingExtension);
      expect(newState.FormData.Content?.meta?.extension?.[1]).toEqual(newExtension);
    });

    it('should replace an existing extension when URL matches', () => {
      const uiStateV1: Extension = {
        url: UISTATE_URL,
        extension: [{ url: STEP_INDEX_URL, valueCode: '0' }],
      };
      const state = createStateWithContent({ extension: [uiStateV1] });

      const uiStateV2: Extension = {
        url: UISTATE_URL,
        extension: [
          { url: STEP_INDEX_URL, valueCode: '2' },
          { url: UPDATED_AT_URL, valueDateTime: '2026-03-03T12:00:00Z' },
        ],
      };
      const newState = dispatchUpdateMetaExtensions(state, [uiStateV2]);

      expect(newState.FormData.Content?.meta?.extension).toHaveLength(1);
      expect(newState.FormData.Content?.meta?.extension?.[0]).toEqual(uiStateV2);
    });

    it('should preserve unrelated extensions when updating a matching one', () => {
      const otherExt: Extension = { url: OTHER_EXT_URL, valueString: 'do-not-touch' };
      const uiStateOld: Extension = {
        url: UISTATE_URL,
        extension: [{ url: STEP_INDEX_URL, valueCode: '0' }],
      };
      const state = createStateWithContent({ extension: [otherExt, uiStateOld] });

      const uiStateNew: Extension = {
        url: UISTATE_URL,
        extension: [{ url: STEP_INDEX_URL, valueCode: '3' }],
      };
      const newState = dispatchUpdateMetaExtensions(state, [uiStateNew]);

      expect(newState.FormData.Content?.meta?.extension).toHaveLength(2);
      expect(newState.FormData.Content?.meta?.extension?.[0]).toEqual(otherExt);
      expect(newState.FormData.Content?.meta?.extension?.[1]).toEqual(uiStateNew);
    });
  });

  describe('multiple extensions in a single dispatch', () => {
    it('should add multiple new extensions at once', () => {
      const state = createStateWithContent({ extension: [] });

      const ext1: Extension = { url: UISTATE_URL, extension: [{ url: STEP_INDEX_URL, valueCode: '1' }] };
      const ext2: Extension = { url: OTHER_EXT_URL, valueString: 'new-value' };
      const newState = dispatchUpdateMetaExtensions(state, [ext1, ext2]);

      expect(newState.FormData.Content?.meta?.extension).toHaveLength(2);
      expect(newState.FormData.Content?.meta?.extension?.[0]).toEqual(ext1);
      expect(newState.FormData.Content?.meta?.extension?.[1]).toEqual(ext2);
    });

    it('should update one and add another in the same dispatch', () => {
      const existingExt: Extension = {
        url: UISTATE_URL,
        extension: [{ url: STEP_INDEX_URL, valueCode: '0' }],
      };
      const state = createStateWithContent({ extension: [existingExt] });

      const updatedUiState: Extension = {
        url: UISTATE_URL,
        extension: [{ url: STEP_INDEX_URL, valueCode: '5' }],
      };
      const brandNewExt: Extension = { url: OTHER_EXT_URL, valueString: 'hello' };
      const newState = dispatchUpdateMetaExtensions(state, [updatedUiState, brandNewExt]);

      expect(newState.FormData.Content?.meta?.extension).toHaveLength(2);
      expect(newState.FormData.Content?.meta?.extension?.[0]).toEqual(updatedUiState);
      expect(newState.FormData.Content?.meta?.extension?.[1]).toEqual(brandNewExt);
    });
  });

  describe('sequential dispatches', () => {
    it('should correctly upsert across multiple sequential dispatches', () => {
      const state = createStateWithContent({ extension: [] });

      // First dispatch: add uiState
      const step0: Extension = {
        url: UISTATE_URL,
        extension: [{ url: STEP_INDEX_URL, valueCode: '0' }],
      };
      const state1 = dispatchUpdateMetaExtensions(state, [step0]);
      expect(state1.FormData.Content?.meta?.extension).toHaveLength(1);

      // Second dispatch: add a different extension
      const otherExt: Extension = { url: OTHER_EXT_URL, valueString: 'data' };
      const state2 = dispatchUpdateMetaExtensions(state1, [otherExt]);
      expect(state2.FormData.Content?.meta?.extension).toHaveLength(2);

      // Third dispatch: update uiState, other should remain
      const step1: Extension = {
        url: UISTATE_URL,
        extension: [
          { url: STEP_INDEX_URL, valueCode: '1' },
          { url: UPDATED_AT_URL, valueDateTime: '2026-03-03T14:00:00Z' },
        ],
      };
      const state3 = dispatchUpdateMetaExtensions(state2, [step1]);
      expect(state3.FormData.Content?.meta?.extension).toHaveLength(2);
      expect(state3.FormData.Content?.meta?.extension?.[0]).toEqual(step1);
      expect(state3.FormData.Content?.meta?.extension?.[1]).toEqual(otherExt);
    });
  });

  describe('edge cases', () => {
    it('should handle extension with undefined url gracefully', () => {
      const existingExt: Extension = { url: UISTATE_URL, valueString: 'existing' };
      const state = createStateWithContent({ extension: [existingExt] });

      // Extension with no url - should be appended (no match by url)
      const noUrlExt: Extension = { url: undefined as unknown as string, valueString: 'no-url' };
      const newState = dispatchUpdateMetaExtensions(state, [noUrlExt]);

      // The undefined-url extension shouldn't match the existing one
      expect(newState.FormData.Content?.meta?.extension).toHaveLength(2);
    });

    it('should handle empty extension array in payload', () => {
      const existingExt: Extension = { url: UISTATE_URL, valueString: 'existing' };
      const state = createStateWithContent({ extension: [existingExt] });

      const newState = dispatchUpdateMetaExtensions(state, []);
      expect(newState.FormData.Content?.meta?.extension).toHaveLength(1);
      expect(newState.FormData.Content?.meta?.extension?.[0]).toEqual(existingExt);
    });

    it('should handle dispatching the same extension url twice in one payload', () => {
      const state = createStateWithContent({ extension: [] });

      const ext1: Extension = { url: UISTATE_URL, extension: [{ url: STEP_INDEX_URL, valueCode: '0' }] };
      const ext2: Extension = { url: UISTATE_URL, extension: [{ url: STEP_INDEX_URL, valueCode: '1' }] };
      const newState = dispatchUpdateMetaExtensions(state, [ext1, ext2]);

      // Second one with same url should overwrite the first
      expect(newState.FormData.Content?.meta?.extension).toHaveLength(1);
      expect(newState.FormData.Content?.meta?.extension?.[0]).toEqual(ext2);
    });
  });

  describe('action creator shape', () => {
    it('should produce an action with the correct type and payload', () => {
      const extension: Extension = { url: UISTATE_URL, valueCode: 'test' };
      const action = actions.updateQuestionnaireResponseMetaExtensions({ extension: [extension] });

      expect(action.type).toBe('form/updateQuestionnaireResponseMetaExtensions');
      expect(action.payload).toEqual({ extension: [extension] });
    });
  });
});
