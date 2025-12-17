import { type Mock, vi } from 'vitest';

import type { QuestionnaireItemWithAnswers } from '../../interface';
import type { IStandardTableColumn } from '../interface';
import type { Options } from '@/types/formTypes/radioGroupOptions';
import type { QuestionnaireResponseItem, QuestionnaireItem, QuestionnaireResponse, Resource } from 'fhir/r4';

import * as tableUtils from '../../utils';
import {
  createBodyRows,
  createColumnsFromAnswers,
  createHeaderRow,
  createRowsFromAnswersCodes,
  createTableColumn,
  emptyTable,
  emptyTableWithId,
  findFirstChoiceItem,
  getStandardTableObject,
  needsExtraColumn,
} from '../utils';

import ItemType from '@/constants/itemType';
import * as choiceUtils from '@/util/choice';
vi.mock('../../utils');
vi.mock('@/util/choice');

describe('emptyTable', () => {
  it('should return an empty table', () => {
    const table = emptyTable();
    expect(table).toEqual({
      headerRow: [],
      rows: [],
      id: '',
    });
  });
});

describe('emptyTableWithId', () => {
  it('should return an empty table with the given id', () => {
    const table = emptyTableWithId('tableId');
    expect(table).toEqual({
      id: 'tableId',
      headerRow: [],
      rows: [],
    });
  });

  it('should return an empty table with an empty id if no id is provided', () => {
    const table = emptyTableWithId('');
    expect(table).toEqual({
      id: '',
      headerRow: [],
      rows: [],
    });
  });
});

describe('createTableColumn', () => {
  it('should create a table column with the given value, index, and id', () => {
    const column = createTableColumn('value', 0, 'columnId', 'boolean');
    expect(column).toEqual({
      type: 'boolean',
      value: 'value',
      index: 0,
      id: 'columnId',
    } as IStandardTableColumn);
  });
});

describe('createHeaderRow', () => {
  beforeEach(() => {
    vi.spyOn(tableUtils, 'getEnabledQuestionnaireItemsWithAnswers');
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it('should create a header row with the given choice values and extra column flag', () => {
    const choiceValues: Options[] = [
      { type: '1', label: 'Option A' },
      { type: '2', label: 'Option B' },
    ];
    const hasExtraColumn = true;
    const headerRow = createHeaderRow(choiceValues, hasExtraColumn);
    expect(headerRow).toEqual([
      {
        id: 'quest-0',
        index: 0,
        value: '',
      },
      {
        id: '1-1',
        index: 1,
        value: 'Option A',
      },
      {
        id: '2-2',
        index: 2,
        value: 'Option B',
      },
      {
        id: 'comment-4',
        index: 4,
        value: '',
      },
    ]);
  });

  it('should create a header row without an extra column if the flag is false', () => {
    const choiceValues: Options[] = [
      { type: '1', label: 'Option A' },
      { type: '2', label: 'Option B' },
    ];
    const hasExtraColumn = false;
    const headerRow = createHeaderRow(choiceValues, hasExtraColumn);
    expect(headerRow).toEqual([
      {
        id: 'quest-0',
        index: 0,
        value: '',
      },
      {
        id: '1-1',
        index: 1,
        value: 'Option A',
      },
      {
        id: '2-2',
        index: 2,
        value: 'Option B',
      },
    ]);
  });
});

describe('createBodyRows', () => {
  beforeEach(() => {
    vi.spyOn(tableUtils, 'getEnabledQuestionnaireItemsWithAnswers');
    vi.spyOn(tableUtils, 'transformAnswersToListOfStrings');
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.skip('should create body rows from the given questionnaire items, response items, extra column flag, and choice values', () => {
    (tableUtils.getEnabledQuestionnaireItemsWithAnswers as Mock).mockImplementation((): QuestionnaireResponseItem[] => {
      return [
        { linkId: '1', answer: [{ valueCoding: { code: '1' } }] },
        { linkId: '2', answer: [{ valueCoding: { code: '2' } }] },
      ] as QuestionnaireResponseItem[];
    });
    (tableUtils.transformAnswersToListOfStrings as Mock).mockImplementation(() => {
      return ['A', 'B'];
    });
    const items: QuestionnaireItem[] = [
      { linkId: '1', text: 'Question 1', type: ItemType.CHOICE },
      { linkId: '2', text: 'Question 2', type: ItemType.CHOICE },
    ];
    const responseItems: QuestionnaireResponse = {
      id: 'responseId',
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      item: [
        { linkId: '1', answer: [{ valueCoding: { code: '1' } }] },
        { linkId: '2', answer: [{ valueCoding: { code: '2' } }] },
      ],
    };
    const needsExtraColumn = true;
    const choiceValues: Options[] = [
      { type: '1', label: 'Option A' },
      { type: '2', label: 'Option B' },
    ];
    const bodyRows = createBodyRows(items, responseItems, needsExtraColumn, choiceValues);
    expect(bodyRows).toEqual([
      {
        id: '1',
        index: 0,
        columns: [
          { value: '', index: 0, id: '1-question' },
          { value: 'X', index: 1, id: '1-1' },
          { value: '', index: 2, id: '2-2' },
          { value: '', index: 3, id: '1-answer' },
        ],
      },
      {
        id: '2',
        index: 1,
        columns: [
          { value: '', index: 0, id: '2-question' },
          { value: '', index: 1, id: '1-1' },
          { value: 'X', index: 2, id: '2-2' },
          { value: '', index: 3, id: '2-answer' },
        ],
      },
    ]);
  });

  it('should create body rows without an extra column if the flag is false', async () => {
    ((await tableUtils.getEnabledQuestionnaireItemsWithAnswers) as Mock).mockImplementation((): QuestionnaireResponseItem[] => {
      return [
        { linkId: '1', answer: [{ valueCoding: { code: '1' } }] },
        { linkId: '2', answer: [{ valueCoding: { code: '2' } }] },
      ] as QuestionnaireResponseItem[];
    });
    const items: QuestionnaireItem[] = [
      { linkId: '1', text: 'Question 1', type: ItemType.CHOICE },
      { linkId: '2', text: 'Question 2', type: ItemType.CHOICE },
    ];
    const responseItems: QuestionnaireResponse = {
      id: 'responseId',
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      item: [
        { linkId: '1', answer: [{ valueCoding: { code: '1' } }] },
        { linkId: '2', answer: [{ valueCoding: { code: '2' } }] },
      ],
    };
    const needsExtraColumn = false;
    const choiceValues: Options[] = [
      { type: '1', label: 'Option A' },
      { type: '2', label: 'Option B' },
    ];
    const bodyRows = await createBodyRows(items, responseItems, needsExtraColumn, choiceValues);
    expect(bodyRows).toEqual([
      {
        id: '1',
        index: 0,
        columns: [
          {
            value: '',
            index: 0,
            id: '1-question',
          },
          {
            id: '1-1',
            index: 1,
            value: 'X',
          },
          {
            id: '2-2',
            index: 2,
            value: '',
          },
        ],
      },
      {
        id: '2',
        index: 1,
        columns: [
          {
            value: '',
            index: 0,
            id: '2-question',
          },
          {
            id: '1-1',
            index: 1,
            value: '',
          },
          {
            id: '2-2',
            index: 2,
            value: 'X',
          },
        ],
      },
    ]);
  });
});

describe('createRowsFromAnswersCodes', () => {
  beforeEach(() => {
    vi.spyOn(choiceUtils, 'getSystemForItem');
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it('should create rows from the given response item and choice values', () => {
    (choiceUtils.getSystemForItem as Mock).mockImplementation(() => {
      return 'sys';
    });
    const item: QuestionnaireItemWithAnswers = {
      linkId: '1',
      type: ItemType.CHOICE,
      answer: [{ valueCoding: { code: '1' } }],
    };

    const choiceValues: Options[] = [
      { type: '1', label: 'Option A' },
      { type: '2', label: 'Option B' },
    ];
    const rows = createRowsFromAnswersCodes(item, choiceValues, 'sys', []);
    expect(rows).toEqual([
      { id: '1-1', index: 1, value: 'X', type: ItemType.CHOICE },
      { id: '2-2', index: 2, value: '', type: ItemType.CHOICE },
    ]);
  });

  it('should return an empty array if no choice values are provided', () => {
    const item: QuestionnaireItemWithAnswers = {
      linkId: '1',
      type: ItemType.CHOICE,
      answerOption: [
        {
          valueCoding: {
            system: 'sys',
          },
        },
      ],
      answer: [{ valueCoding: { code: '1' } }],
    };
    const rows = createRowsFromAnswersCodes(item);
    expect(rows).toEqual([]);
  });
});

describe('createColumnsFromAnswers', () => {
  beforeEach(() => {
    vi.spyOn(tableUtils, 'transformAnswersToListOfStrings');
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it('should create columns from the given response item and choice values', () => {
    (tableUtils.transformAnswersToListOfStrings as Mock).mockImplementation(() => {
      return ['A', 'B'];
    });
    const item: QuestionnaireItemWithAnswers = {
      linkId: '1',
      text: 'Question 1',
      type: ItemType.CHOICE,
      item: [
        {
          linkId: '1.1',
          type: ItemType.CHOICE,
          answer: [{ valueCoding: { code: '1' } }],
        },
        {
          linkId: '1.2',
          type: ItemType.CHOICE,
          answer: [{ valueCoding: { code: '2' } }],
        },
      ],
    };
    const choiceValues: Options[] = [
      { type: '1', label: 'Option A' },
      { type: '2', label: 'Option B' },
    ];
    const columns = createColumnsFromAnswers(item, choiceValues);
    expect(columns).toEqual([
      { value: 'Question 1', index: 0, id: '1-question', type: ItemType.CHOICE },
      { value: '', index: 1, id: '1-1', type: ItemType.CHOICE },
      { value: '', index: 2, id: '2-2', type: ItemType.CHOICE },
      { value: '', index: 3, id: '1-answer', type: ItemType.CHOICE },
    ]);
  });

  it('should return an empty array if no choice values are provided', () => {
    (tableUtils.transformAnswersToListOfStrings as Mock).mockImplementation(() => {
      return [];
    });
    const item: QuestionnaireItemWithAnswers = {
      linkId: '1',
      text: 'Question 1',
      type: ItemType.CHOICE,
      item: [
        {
          linkId: '1.1',
          answer: [{ valueCoding: { code: '1' } }],
          type: ItemType.CHOICE,
        },
        {
          linkId: '1.2',
          answer: [{ valueCoding: { code: '2' } }],
          type: ItemType.CHOICE,
        },
      ],
    };
    const columns = createColumnsFromAnswers(item);
    expect(columns).toEqual([
      { value: 'Question 1', index: 0, id: '1-question', type: ItemType.CHOICE },
      { value: '', index: 1, id: '1-answer', type: ItemType.CHOICE },
    ]);
  });
});

describe('getStandardTableObject', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });
  beforeEach(() => {
    vi.spyOn(tableUtils, 'getEnabledQuestionnaireItemsWithAnswers');
    vi.spyOn(tableUtils, 'transformAnswersToListOfStrings');
    vi.spyOn(choiceUtils, 'getContainedOptions');
  });
  it('should return an empty table if no response items or items are provided', async () => {
    const table = await getStandardTableObject([], null);
    expect(table).toEqual({
      headerRow: [],
      rows: [],
      id: '',
    });
  });

  it('should return an empty table with the response items id if no first choice item is found', async () => {
    const items: QuestionnaireItem[] = [
      { linkId: '1', text: 'Question 1', type: ItemType.TEXT },
      { linkId: '2', text: 'Question 2', type: ItemType.TEXT },
    ];
    const responseItems: QuestionnaireResponse = {
      id: 'responseId',
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      item: [
        { linkId: '1', answer: [{ valueCoding: { code: '1' } }] },
        { linkId: '2', answer: [{ valueCoding: { code: '2' } }] },
      ],
    };
    const table = await getStandardTableObject(items, responseItems);
    expect(table).toEqual({
      id: 'responseId',
      headerRow: [],
      rows: [],
    });
  });

  it('should return a table with the response items id, header row, and body rows', async () => {
    (tableUtils.getEnabledQuestionnaireItemsWithAnswers as Mock).mockImplementation(() => {
      return [
        { linkId: '1', text: 'Question 1', answer: [{ valueCoding: { code: '1' } }] },
        {
          linkId: '2',
          answer: [{ valueCoding: { code: '2' } }],
        },
      ] as QuestionnaireResponseItem[];
    });
    (tableUtils.transformAnswersToListOfStrings as Mock).mockImplementation(() => {
      return ['string'];
    });
    (choiceUtils.getContainedOptions as Mock).mockImplementation((): Options[] => {
      return [
        { type: '1', label: 'Option A' },
        { type: '2', label: 'Option B' },
      ];
    });
    const items: QuestionnaireItem[] = [
      { linkId: '1', text: 'Question 1', type: ItemType.CHOICE },
      { linkId: '2', text: 'Question 2', type: ItemType.CHOICE },
    ];
    const responseItems: QuestionnaireResponse = {
      id: 'responseId',
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      item: [
        { linkId: '1', answer: [{ valueCoding: { code: '1' } }] },
        { linkId: '2', answer: [{ valueCoding: { code: '2' } }] },
      ],
    };
    const resource: Resource[] = [];
    const table = await getStandardTableObject(items, responseItems, resource);

    expect(table).toEqual({
      id: 'responseId',
      headerRow: [
        {
          id: 'quest-0',
          index: 0,
          value: '',
        },
        {
          id: '1-1',
          index: 1,
          value: 'Option A',
        },
        {
          id: '2-2',
          index: 2,
          value: 'Option B',
        },
      ],
      rows: [
        {
          id: '1',
          index: 0,
          columns: [
            {
              value: 'Question 1',
              index: 0,
              id: '1-question',
            },
            {
              id: '1-1',
              index: 1,
              value: 'X',
            },
            {
              id: '2-2',
              index: 2,
              value: '',
            },
          ],
        },
        {
          id: '2',
          index: 1,
          columns: [
            {
              value: '',
              index: 0,
              id: '2-question',
            },
            {
              id: '1-1',
              index: 1,
              value: '',
            },
            {
              id: '2-2',
              index: 2,
              value: 'X',
            },
          ],
        },
      ],
    });
  });
});

describe('findFirstChoiceItem', () => {
  it('should return the first choice item from the given items', () => {
    const items: QuestionnaireItem[] = [
      { linkId: '1', text: 'Question 1', type: ItemType.TEXT },
      { linkId: '2', text: 'Question 2', type: ItemType.CHOICE },
      { linkId: '3', text: 'Question 3', type: ItemType.CHOICE },
    ];
    const firstChoiceItem = findFirstChoiceItem(items);
    expect(firstChoiceItem).toEqual({ linkId: '2', text: 'Question 2', type: ItemType.CHOICE });
  });

  it('should return undefined if no choice item is found', () => {
    const items: QuestionnaireItem[] = [
      { linkId: '1', text: 'Question 1', type: ItemType.TEXT },
      { linkId: '2', text: 'Question 2', type: ItemType.TEXT },
    ];
    const firstChoiceItem = findFirstChoiceItem(items);
    expect(firstChoiceItem).toBeUndefined();
  });
});

describe.skip('needsExtraColumn', () => {
  beforeEach(() => {
    vi.spyOn(tableUtils, 'getEnabledQuestionnaireItemsWithAnswers');
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it.skip('should return true if any answer has a non-empty last column value', () => {
    (tableUtils.getEnabledQuestionnaireItemsWithAnswers as Mock).mockImplementation(() => {
      return [
        { linkId: '1', text: 'Question 1', answer: [{ valueCoding: { code: 'A' } }] },
        {
          linkId: '2',
          answer: [{ valueCoding: { code: 'B' } }],
          item: [{ linkId: '3', text: 'Question 2', type: ItemType.STRING, answer: [{ valueString: 'test test test' }] }],
        },
      ] as QuestionnaireResponseItem[];
    });
    (tableUtils.transformAnswersToListOfStrings as Mock).mockImplementation(() => {
      return ['string'];
    });
    const items: QuestionnaireItem[] = [
      { linkId: '1', text: 'Question 1', type: ItemType.CHOICE },
      { linkId: '2', text: 'Question 2', type: ItemType.CHOICE, item: [{ linkId: '3', type: ItemType.TEXT, text: 'Qest 3' }] },
    ];
    const responseItems: QuestionnaireResponse = {
      id: 'responseId',
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      item: [
        { linkId: '1', answer: [{ valueCoding: { code: 'A' } }] },
        {
          linkId: '2',
          answer: [{ valueCoding: { code: 'B' } }],
          item: [{ linkId: '3', answer: [{ valueString: 'Answer' }] }],
        },
      ],
    };

    const extraColumnNeeded = needsExtraColumn(items, responseItems);
    expect(extraColumnNeeded).toBe(true);
  });

  it.skip('should return false if items have no children', () => {
    (tableUtils.getEnabledQuestionnaireItemsWithAnswers as Mock).mockImplementation(() => {
      return [
        { linkId: '1', text: 'Question 1', answer: [{ valueCoding: { code: 'A' } }] },
        {
          linkId: '2',
          answer: [{ valueCoding: { code: 'B' } }],
          item: [],
        },
      ] as QuestionnaireResponseItem[];
    });
    (tableUtils.transformAnswersToListOfStrings as Mock).mockImplementation(() => {
      return [];
    });
    const items: QuestionnaireItem[] = [
      { linkId: '1', text: 'Question 1', type: ItemType.CHOICE },
      { linkId: '2', text: 'Question 2', type: ItemType.CHOICE },
    ];
    const responseItems: QuestionnaireResponse = {
      id: 'responseId',
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      item: [
        { linkId: '1', answer: [{ valueCoding: { code: '1' } }] },
        { linkId: '2', answer: [{ valueCoding: { code: '2' } }] },
      ],
    };
    const extraColumnNeeded = needsExtraColumn(items, responseItems);
    expect(extraColumnNeeded).toBe(false);
  });
});
