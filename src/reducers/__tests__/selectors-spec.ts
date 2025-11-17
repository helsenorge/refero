// questionnaireRequiredState.test.ts
import { configureStore } from '@reduxjs/toolkit';
import { Questionnaire } from 'fhir/r4';
import { describe, it, expect } from 'vitest';

import rootReducer from '..';
import {
  areAllInputItemsOptional,
  areAllInputItemsRequired,
  hasExactlyOneInputItem,
  questionnaireRequiredStateSelector,
} from '../selectors';

describe('hasExactlyOneInputItem', () => {
  it('returns false for undefined questionnaire', () => {
    expect(hasExactlyOneInputItem(undefined)).toBe(false);
  });

  it('returns false for null questionnaire', () => {
    expect(hasExactlyOneInputItem(null as unknown as Questionnaire)).toBe(false);
  });

  it('returns false when there are no items', () => {
    const q: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft',
    };

    expect(hasExactlyOneInputItem(q)).toBe(false);
  });

  it('returns true when there is exactly one input item at root level', () => {
    const q: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft',
      item: [
        {
          linkId: 'q1',
          type: 'string',
        },
      ],
    };

    expect(hasExactlyOneInputItem(q)).toBe(true);
  });

  it('returns true when there is exactly one nested input item', () => {
    const q: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft',
      item: [
        {
          linkId: 'group-1',
          type: 'group',
          item: [
            {
              linkId: 'q1',
              type: 'choice',
            },
          ],
        },
      ],
    };

    expect(hasExactlyOneInputItem(q)).toBe(true);
  });

  it('returns false when there are multiple input items (flat)', () => {
    const q: Questionnaire = {
      status: 'draft',
      resourceType: 'Questionnaire',
      item: [
        { linkId: 'q1', type: 'string' },
        { linkId: 'q2', type: 'integer' },
      ],
    };

    expect(hasExactlyOneInputItem(q)).toBe(false);
  });

  it('returns false when there are multiple input items (nested)', () => {
    const q: Questionnaire = {
      status: 'draft',
      resourceType: 'Questionnaire',
      item: [
        {
          linkId: 'group-1',
          type: 'group',
          item: [
            { linkId: 'q1', type: 'choice' },
            {
              linkId: 'group-2',
              type: 'group',
              item: [{ linkId: 'q2', type: 'string' }],
            },
          ],
        },
      ],
    };

    expect(hasExactlyOneInputItem(q)).toBe(false);
  });

  it('ignores group and display items when counting', () => {
    const q: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft',
      item: [
        {
          linkId: 'group-1',
          type: 'group',
          item: [
            { linkId: 'info', type: 'display' },
            { linkId: 'q1', type: 'string' },
          ],
        },
      ],
    };

    expect(hasExactlyOneInputItem(q)).toBe(true);
  });
});

describe('areAllInputItemsRequired', () => {
  it('returns true when questionnaire is undefined', () => {
    // allInputItemsMatchPredicate(undefined) => true
    expect(areAllInputItemsRequired(undefined)).toBe(true);
  });

  it('returns true when questionnaire is null', () => {
    expect(areAllInputItemsRequired(null as unknown as Questionnaire)).toBe(true);
  });

  it('returns true when there are no input items (only groups)', () => {
    const q: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft',
      item: [{ linkId: 'group-1', type: 'group', item: [] }],
    };

    expect(areAllInputItemsRequired(q)).toBe(true);
  });

  it('returns true when all input items are required and not readOnly', () => {
    const q: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft',
      item: [
        {
          linkId: 'group-1',
          type: 'group',
          item: [
            { linkId: 'q1', type: 'string', required: true },
            {
              linkId: 'group-2',
              type: 'group',
              item: [{ linkId: 'q2', type: 'integer', required: true }],
            },
          ],
        },
      ],
    };

    expect(areAllInputItemsRequired(q)).toBe(true);
  });

  it('returns false when at least one input item is not required', () => {
    const q: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft',
      item: [
        {
          linkId: 'group-1',
          type: 'group',
          item: [
            { linkId: 'q1', type: 'string', required: true },
            { linkId: 'q2', type: 'integer', required: false },
          ],
        },
      ],
    };

    expect(areAllInputItemsRequired(q)).toBe(false);
  });

  it('treats readOnly=true as NOT required even if required=true', () => {
    const q: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft',
      item: [
        {
          linkId: 'group-1',
          type: 'group',
          item: [
            {
              linkId: 'q1',
              type: 'string',
              required: true,
              readOnly: true,
            },
          ],
        },
      ],
    };

    // predicate: item.required === true && item.readOnly !== true
    // => required=true, readOnly=true => false -> whole function -> false
    expect(areAllInputItemsRequired(q)).toBe(false);
  });
});

describe('areAllInputItemsOptional', () => {
  it('returns true when questionnaire is undefined', () => {
    expect(areAllInputItemsOptional(undefined)).toBe(true);
  });

  it('returns true when questionnaire is null', () => {
    expect(areAllInputItemsOptional(null as unknown as Questionnaire)).toBe(true);
  });

  it('returns true when there are no input items (only groups)', () => {
    const q: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft',
      item: [{ linkId: 'group-1', type: 'group', item: [] }],
    };

    expect(areAllInputItemsOptional(q)).toBe(true);
  });

  it('returns true when all input items are optional (required omitted/false)', () => {
    const q: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft',
      item: [
        {
          linkId: 'group-1',
          type: 'group',
          item: [
            { linkId: 'q1', type: 'string' }, // required undefined => optional
            { linkId: 'q2', type: 'integer', required: false },
          ],
        },
      ],
    };

    expect(areAllInputItemsOptional(q)).toBe(true);
  });

  it('returns false when at least one input item is required=true and not readOnly', () => {
    const q: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft',
      item: [
        {
          linkId: 'group-1',
          type: 'group',
          item: [
            { linkId: 'q1', type: 'string', required: true },
            { linkId: 'q2', type: 'integer', required: false },
          ],
        },
      ],
    };

    expect(areAllInputItemsOptional(q)).toBe(false);
  });

  it('treats readOnly=true as optional even when required=true', () => {
    const q: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft',
      item: [
        {
          linkId: 'group-1',
          type: 'group',
          item: [
            {
              linkId: 'q1',
              type: 'string',
              required: true,
              readOnly: true,
            },
          ],
        },
      ],
    };

    // predicate: item.required !== true || item.readOnly === true
    // => required=true => left false, readOnly=true => right true -> true
    expect(areAllInputItemsOptional(q)).toBe(true);
  });
});

describe('questionnaireRequiredStateSelector', () => {
  const buildState = (content: Questionnaire | null | undefined) => {
    return configureStore({
      reducer: rootReducer,
      preloadedState: {
        refero: {
          form: {
            FormDefinition: {
              Content: content,
            },
            FormData: {
              Content: null,
            },
            Language: 'en',
          },
        },
      },
      middleware: getDefaultMiddleware => getDefaultMiddleware(),
    });
  };

  it('handles null questionnaire in state', () => {
    const state = buildState(null).getState();

    const result = questionnaireRequiredStateSelector(state);

    expect(result.singleItemQuestionnaire).toBe(false);
    expect(result.allRequired).toBe(true); // allInputItemsMatchPredicate(undefined) => true
    expect(result.allOptional).toBe(true);
    expect(result.showLabelPerItem).toBe(false);
  });

  it('single required item: singleItemQuestionnaire=true, allRequired=true, allOptional=false, showLabelPerItem=false', () => {
    const q: Questionnaire = {
      status: 'draft',
      resourceType: 'Questionnaire',
      item: [
        {
          linkId: 'q1',
          type: 'string',
          required: true,
        },
      ],
    };

    const state = buildState(q).getState();
    const result = questionnaireRequiredStateSelector(state);

    expect(result.singleItemQuestionnaire).toBe(true);
    expect(result.allRequired).toBe(true);
    expect(result.allOptional).toBe(false);
    // showLabelPerItem: !single && !allRequired && !allOptional => false
    expect(result.showLabelPerItem).toBe(false);
  });

  it('all optional, multiple items: showLabelPerItem=false', () => {
    const q: Questionnaire = {
      status: 'draft',
      resourceType: 'Questionnaire',
      item: [
        { linkId: 'q1', type: 'string' },
        { linkId: 'q2', type: 'integer', required: false },
      ],
    };

    const state = buildState(q).getState();
    const result = questionnaireRequiredStateSelector(state);

    expect(result.singleItemQuestionnaire).toBe(false);
    expect(result.allRequired).toBe(false);
    expect(result.allOptional).toBe(true);
    expect(result.showLabelPerItem).toBe(false);
  });

  it('mixed required/optional items: showLabelPerItem=true', () => {
    const q: Questionnaire = {
      status: 'draft',
      resourceType: 'Questionnaire',
      item: [
        { linkId: 'q1', type: 'string', required: true },
        { linkId: 'q2', type: 'integer', required: false },
      ],
    };

    const state = buildState(q).getState();
    const result = questionnaireRequiredStateSelector(state);

    expect(result.singleItemQuestionnaire).toBe(false);
    expect(result.allRequired).toBe(false);
    expect(result.allOptional).toBe(false);
    // !single && !allRequired && !allOptional => true
    expect(result.showLabelPerItem).toBe(true);
  });

  it('readOnly=true items behave correctly in selector', () => {
    const q: Questionnaire = {
      status: 'draft',
      resourceType: 'Questionnaire',
      item: [
        {
          linkId: 'q1',
          type: 'string',
          required: true,
          readOnly: true,
        },
      ],
    };

    const state = buildState(q).getState();
    const result = questionnaireRequiredStateSelector(state);

    // singleItemQuestionnaire should still be true (input-type count)
    expect(result.singleItemQuestionnaire).toBe(true);
    // allRequired should be false because readOnly=true overrides required
    expect(result.allRequired).toBe(false);
    // allOptional should be true because readOnly=true makes predicate true
    expect(result.allOptional).toBe(true);
    expect(result.showLabelPerItem).toBe(false);
  });
});
