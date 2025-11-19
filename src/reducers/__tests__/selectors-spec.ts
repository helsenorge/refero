// questionnaireRequiredState.test.ts
import { configureStore } from '@reduxjs/toolkit';
import { Questionnaire, QuestionnaireItem } from 'fhir/r4';
import { describe, it, expect } from 'vitest';

import rootReducer from '..';
import { areAllInputItemsOptional, areAllInputItemsRequired, hasExactlyOneInputItem, RequiredLevelSelector } from '../selectors';

import { Resources } from '@/util/resources';

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

describe('RequiredLevelSelector', () => {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const buildStore = (content: Questionnaire | null | undefined) => {
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

  const resources: Resources = {
    formAllRequired: 'All required',
    formRequired: 'Required field',
    formOptional: 'Optional',
    formAllOptional: 'All optional',
    formRequiredRadiobuttonList: 'Required radio list',
    formRequiredMultiCheckbox: 'Required multi checkbox',
    formRequiredSingleCheckbox: 'Required single checkbox',
    // other fields can be left undefined
  } as Resources;

  it('global: null questionnaire => treated as 0 inputs => level undefined', () => {
    const state = buildStore(null).getState();

    const result = RequiredLevelSelector(state, undefined, resources);

    expect(result.level).toBeUndefined();
    expect(result.errorLevelResources?.['all-required']).toBe(resources.formAllRequired);
    expect(result.errorLevelResources?.['required-field']).toBe(resources.formRequired);
    expect(result.errorLevelResources?.optional).toBe(resources.formOptional);
    expect(result.errorLevelResources?.['all-optional']).toBe(resources.formAllOptional);
    expect(result.errorLevelResources?.['required-radiobutton-list']).toBe(resources.formRequiredRadiobuttonList);
    expect(result.errorLevelResources?.['required-checkbox-list']).toBe(resources.formRequiredMultiCheckbox);
    expect(result.errorLevelResources?.['required-single-checkbox']).toBe(resources.formRequiredSingleCheckbox);
  });

  it('global: questionnaire with only group/display items => 0 inputs => level undefined', () => {
    const q: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft',
      item: [
        {
          linkId: 'step-1',
          type: 'group',
          item: [
            { linkId: 'info-1', type: 'display', text: 'Lorem ipsum' },
            { linkId: 'info-2', type: 'display', text: 'Dolor sit amet' },
          ],
        },
        {
          linkId: 'step-2',
          type: 'group',
          item: [{ linkId: 'info-3', type: 'display', text: 'More text' }],
        },
      ],
    };

    const state = buildStore(q).getState();
    const result = RequiredLevelSelector(state, undefined, resources);

    expect(result.level).toBeUndefined();
  });

  it('per-item: questionnaire with only group/display items => level undefined', () => {
    const q: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft',
      item: [
        {
          linkId: 'step-1',
          type: 'group',
          item: [
            { linkId: 'info-1', type: 'display', text: 'Lorem ipsum' },
            { linkId: 'info-2', type: 'display', text: 'Dolor sit amet' },
          ],
        },
      ],
    };

    const state = buildStore(q).getState();
    const item = (q.item?.[0].item?.[0] ?? null) as QuestionnaireItem; // a display item

    const result = RequiredLevelSelector(state, item, resources);

    expect(result.level).toBeUndefined();
  });

  it('global: single required item => singleItemQuestionnaire=true => level undefined', () => {
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

    const state = buildStore(q).getState();
    const result = RequiredLevelSelector(state, undefined, resources);

    expect(result.level).toBeUndefined();
  });

  it('global: all optional, multiple items => level "all-optional"', () => {
    const q: Questionnaire = {
      status: 'draft',
      resourceType: 'Questionnaire',
      item: [
        { linkId: 'q1', type: 'string' },
        { linkId: 'q2', type: 'integer', required: false },
      ],
    };

    const state = buildStore(q).getState();
    const result = RequiredLevelSelector(state, undefined, resources);

    expect(result.level).toBe('all-optional');
  });

  it('global: mixed required/optional items => level undefined', () => {
    const q: Questionnaire = {
      status: 'draft',
      resourceType: 'Questionnaire',
      item: [
        { linkId: 'q1', type: 'string', required: true },
        { linkId: 'q2', type: 'integer', required: false },
      ],
    };

    const state = buildStore(q).getState();
    const result = RequiredLevelSelector(state, undefined, resources);

    expect(result.level).toBeUndefined();
  });

  it('per-item: mixed questionnaire => showLabelPerItem=true => required string => "required-field"', () => {
    const q: Questionnaire = {
      status: 'draft',
      resourceType: 'Questionnaire',
      item: [
        { linkId: 'q1', type: 'string', required: true },
        { linkId: 'q2', type: 'integer', required: false },
      ],
    };

    const state = buildStore(q).getState();
    const item = (q.item as QuestionnaireItem[])[0]; // required string

    const result = RequiredLevelSelector(state, item, resources);

    expect(result.level).toBe('required-field');
  });

  it('per-item: mixed questionnaire => required boolean => "required-single-checkbox"', () => {
    const q: Questionnaire = {
      status: 'draft',
      resourceType: 'Questionnaire',
      item: [
        { linkId: 'q1', type: 'boolean', required: true },
        { linkId: 'q2', type: 'integer', required: false },
      ],
    };

    const state = buildStore(q).getState();
    const item = (q.item as QuestionnaireItem[])[0]; // required boolean

    const result = RequiredLevelSelector(state, item, resources);

    expect(result.level).toBe('required-single-checkbox');
  });

  it('per-item: allRequired questionnaire => showLabelPerItem=false => level undefined even if item is required', () => {
    const q: Questionnaire = {
      status: 'draft',
      resourceType: 'Questionnaire',
      item: [
        { linkId: 'q1', type: 'string', required: true },
        { linkId: 'q2', type: 'integer', required: true },
      ],
    };

    const state = buildStore(q).getState();
    const item = (q.item as QuestionnaireItem[])[0];

    const result = RequiredLevelSelector(state, item, resources);

    // allRequired=true, allOptional=false, singleItem=false => showLabelPerItem=false
    expect(result.level).toBeUndefined();
  });
});
