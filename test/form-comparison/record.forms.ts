import fs from 'fs';
import path from 'path';

import { afterAll, beforeAll, describe, it, vi } from 'vitest';

import type { Questionnaire, QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import {
  answerEverything,
  countExpressions,
  createRng,
  describeEdit,
  extractQuestionnaires,
  hash,
  indexQuestionnaire,
  occurrences,
  openGates,
  randomEdit,
  type Edit,
} from './scenario';

// What is used of the implementation under test: the store and the actions the form components dispatch. Keep
// it to things that exist on every ref that is to be compared.
import { setSkjemaDefinitionAction } from '@/actions/form';
import { addRepeatItemAction, deleteRepeatItemAction, newValue, removeCodingValueAction } from '@/actions/newValue';
import { runCalculatorsAction, runEnableWhenAction } from '@/actions/thunks';
import { store as createStore } from '@/reducers';
import { getResponseItemAndPathWithLinkId } from '@/util/refero-core';

/**
 * Fills in every form in a folder through refero's store - the same actions the components dispatch when a
 * user answers, repeats and removes - and records the QuestionnaireResponse after every step. Covers
 * everything that decides the response: the reducers, enableWhen, scoring and the FHIRPath calculations. It
 * does not render. Started by run.mjs, which sets the environment variables; see README.md.
 */

const FORMS_DIR = process.env.FORM_COMPARISON_FORMS ?? '';
const OUT = process.env.FORM_COMPARISON_OUT ?? '';
const FILTER = (process.env.FORM_COMPARISON_FILTER ?? '').toLowerCase();
const SEEDS = (process.env.FORM_COMPARISON_SEEDS ?? '1').split(',').map(Number);
const STEPS = Number(process.env.FORM_COMPARISON_STEPS ?? 25);
const ONLY_EXPRESSIONS = process.env.FORM_COMPARISON_ONLY_EXPRESSIONS === '1';
const ALL_LANGUAGES = process.env.FORM_COMPARISON_ALL_LANGUAGES === '1';
const DUMP = process.env.FORM_COMPARISON_DUMP === '1';
// Expressions use today() and now(); a fixed clock makes two recordings comparable.
const FIXED_NOW = new Date('2026-01-15T10:00:00Z');
// The calculations are debounced; time is moved past that until the response stops changing.
const SETTLE_MS = 200;
const MAX_SETTLE_ROUNDS = 15;
// An answer to a question that is not shown is removed again by enableWhen. A step whose edit left the response
// as it was tries another edit, so most steps do something.
const MAX_ATTEMPTS = 6;
const ANSWER_EVERYTHING_PASSES = 2;
// Every answer is followed by a full round of calculations, so answering everything in a form with thousands of
// questions takes minutes. Above this many, an even selection across the form is answered instead.
const MAX_ANSWERS_PER_PASS = Number(process.env.FORM_COMPARISON_MAX_ANSWERS ?? 120);

function spread<T>(list: T[], max: number): T[] {
  if (list.length <= max) return list;
  return Array.from({ length: max }, (_, index) => list[Math.floor((index * list.length) / max)]);
}

// The calculation options are application wide. The module is looked up rather than imported, so the recorder
// also runs on refs from before the options existed; those record 'legacy' only.
const optionsModule = Object.values(import.meta.glob('/src/util/fhirPathOptions.ts', { eager: true }))[0] as
  { setFhirPathCalculationOptions?: (options?: Record<string, unknown>) => void } | undefined;
const OPTION_SETS: Array<[string, Record<string, unknown> | undefined]> = [
  ['legacy', undefined],
  ...(optionsModule?.setFhirPathCalculationOptions
    ? ([
        [
          'corrected',
          { keepZeroValues: true, omitNonNumericResults: true, resolveExpressionChains: true, expressionPriority: 'copy-first' },
        ],
      ] as Array<[string, Record<string, unknown>]>)
    : []),
];

interface Round {
  /**
   * Hash of the answers per item, as linkId[occurrence], only for the items that changed since the previous
   * step; null when the item is gone. '(response)' is the whole QuestionnaireResponse.
   */
  changed: Record<string, string | null>;
  response?: QuestionnaireResponse | null;
}

interface Step {
  edit: string;
  /** Hash of the response before the edit. */
  input: string;
  rounds: Round[];
}

interface Run {
  options: string;
  seed: number;
  ms: number;
  error?: string;
  /** Only with --dump. */
  errorStack?: string;
  /** Errors thrown outside the step itself, for example in the debounced calculation. */
  asyncErrors?: string[];
  steps: Step[];
}

interface FormResult {
  questionnaires: Array<{ id: string; expressions: number; runs: Run[] }>;
  error?: string;
}

type Store = ReturnType<typeof createStore>;

function listFiles(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap(entry =>
      entry.isDirectory()
        ? listFiles(path.join(dir, entry.name))
        : entry.name.toLowerCase().endsWith('.json')
          ? [path.join(dir, entry.name)]
          : []
    )
    .sort();
}

function readJson(file: string): unknown {
  const text = fs.readFileSync(file, 'utf8');
  // Some files start with a byte order mark.
  return JSON.parse(text.charCodeAt(0) === 0xfeff ? text.slice(1) : text);
}

function withoutNestedItems(answer: QuestionnaireResponseItemAnswer): QuestionnaireResponseItemAnswer {
  const value = { ...answer };
  delete value.item;
  return value;
}

const responseOf = (store: Store): QuestionnaireResponse | null | undefined => store.getState().refero.form.FormData.Content;

/** Does to the store what the component for the item does when the user makes the edit. */
function dispatchEdit(store: Store, edit: Edit, definitions: Map<string, QuestionnaireItem>): boolean {
  const qr = responseOf(store);
  const item = definitions.get(edit.linkId);
  const target = occurrences(qr).find(occurrence => occurrence.item.linkId === edit.linkId && occurrence.number === edit.number);
  const located = qr && getResponseItemAndPathWithLinkId(edit.linkId, qr).find(found => found.item === target?.item);
  if (!item || !target || !located) return false;
  const itemPath = located.path;
  const multipleAnswers = !!item.repeats;
  const current = target.item.answer ?? [];

  const clear = (): void => {
    if (item.type === 'choice' || item.type === 'open-choice') {
      for (const answer of current) {
        if (answer.valueCoding) store.dispatch(removeCodingValueAction({ itemPath, valueCoding: answer.valueCoding, item }));
      }
    } else if (item.type === 'boolean') {
      store.dispatch(newValue({ itemPath, valueBoolean: false, item }));
    } else if (item.type === 'string' || item.type === 'text') {
      store.dispatch(newValue({ itemPath, valueString: '', item }));
    } else {
      const key = Object.keys(current[0] ?? {}).find(name => name.startsWith('value'));
      if (key) store.dispatch(newValue({ itemPath, [key]: undefined, item } as never));
    }
  };

  switch (edit.kind) {
    case 'answer':
      if ((item.type === 'choice' || item.type === 'open-choice') && multipleAnswers) clear();
      for (const answer of edit.answer) {
        const value = withoutNestedItems(answer);
        store.dispatch(newValue({ itemPath, ...value, item, multipleAnswers } as never));
      }
      break;
    case 'clear':
      clear();
      break;
    case 'addRepeat': {
      const parentPath = itemPath.slice(0, -1);
      const responseItems = target.siblings.filter(sibling => sibling.linkId === edit.linkId);
      store.dispatch(addRepeatItemAction({ parentPath, item, responseItems }));
      break;
    }
    case 'removeRepeat':
      store.dispatch(deleteRepeatItemAction({ itemPath, item }));
      break;
  }
  // What useOnAnswerChange does after every change.
  store.dispatch(runCalculatorsAction());
  store.dispatch(runEnableWhenAction());
  return true;
}

async function settle(store: Store): Promise<void> {
  let previous = '';
  let stable = 0;
  for (let round = 0; round < MAX_SETTLE_ROUNDS && stable < 2; round++) {
    await vi.advanceTimersByTimeAsync(SETTLE_MS);
    const current = hash(responseOf(store));
    stable = current === previous ? stable + 1 : 0;
    previous = current;
  }
}

let asyncErrors: string[] = [];
const onAsyncError = (error: unknown): void => {
  asyncErrors.push(error instanceof Error ? `${error.name}: ${error.message}` : String(error));
};

async function record(
  questionnaire: Questionnaire,
  optionName: string,
  options: Record<string, unknown> | undefined,
  seed: number
): Promise<Run> {
  const run: Run = { options: optionName, seed, ms: 0, steps: [] };
  const rng = createRng(seed);
  const definitions = indexQuestionnaire(questionnaire);
  let previous = new Map<string, string>();
  asyncErrors = [];

  const snapshot = (store: Store): Round => {
    const qr = responseOf(store);
    const current = new Map<string, string>([['(response)', hash(qr)]]);
    for (const occurrence of occurrences(qr)) {
      const answers = (occurrence.item.answer ?? []).map(withoutNestedItems);
      current.set(`${occurrence.item.linkId}[${occurrence.number}]`, hash(answers));
    }
    const changed: Record<string, string | null> = {};
    for (const [key, value] of current) if (previous.get(key) !== value) changed[key] = value;
    for (const key of previous.keys()) if (!current.has(key)) changed[key] = null;
    previous = current;
    return { changed, ...(DUMP && { response: structuredClone(qr) }) };
  };

  optionsModule?.setFhirPathCalculationOptions?.(options);
  const started = performance.now();
  try {
    const store = createStore();
    for (let stepNumber = 0; stepNumber <= STEPS; stepNumber++) {
      const input = hash(responseOf(store));
      let edit: string;
      if (stepNumber === 0) {
        edit = 'load';
        store.dispatch(setSkjemaDefinitionAction({ questionnaire, language: questionnaire.language }));
      } else if (stepNumber === Math.ceil(STEPS / 2)) {
        // One at a time, each settled, as a user going through the form.
        edit = 'answer everything';
        for (let pass = 0; pass < ANSWER_EVERYTHING_PASSES; pass++) {
          // First the answers that show more of the form, then everything that is still unanswered.
          for (const single of spread(openGates(rng, responseOf(store), definitions), MAX_ANSWERS_PER_PASS)) {
            if (dispatchEdit(store, single, definitions)) await settle(store);
          }
          for (const single of spread(answerEverything(rng, questionnaire, responseOf(store), definitions), MAX_ANSWERS_PER_PASS)) {
            if (dispatchEdit(store, single, definitions)) await settle(store);
          }
        }
      } else {
        const attempts: string[] = [];
        for (let attempt = 0; attempt < MAX_ATTEMPTS && hash(responseOf(store)) === input; attempt++) {
          const chosen = randomEdit(rng, questionnaire, responseOf(store), definitions);
          attempts.push(chosen ? describeEdit(chosen) : 'nothing to do');
          if (chosen && dispatchEdit(store, chosen, definitions)) await settle(store);
        }
        edit = attempts.join(', then ');
      }
      await settle(store);
      run.steps.push({ edit, input, rounds: [snapshot(store)] });
    }
  } catch (error) {
    run.error = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    if (DUMP && error instanceof Error) run.errorStack = error.stack;
  }
  run.ms = Math.round((performance.now() - started) * 10) / 10;
  if (asyncErrors.length > 0) run.asyncErrors = [...new Set(asyncErrors)].sort();
  optionsModule?.setFhirPathCalculationOptions?.(undefined);
  return run;
}

const relativeName = (file: string): string => path.relative(FORMS_DIR, file).replace(/\\/g, '/');
const allFiles =
  FORMS_DIR && fs.existsSync(FORMS_DIR)
    ? listFiles(FORMS_DIR).filter(file => !FILTER || relativeName(file).toLowerCase().includes(FILTER.replace(/\\/g, '/')))
    : [];
// run.mjs splits the forms over several processes: process i of n takes every n-th file.
const [SHARD, SHARDS] = (process.env.FORM_COMPARISON_SHARD ?? '0/1').split('/').map(Number);
const files = allFiles.filter((_, index) => index % SHARDS === SHARD);
const results: Record<string, FormResult> = {};

describe('form comparison: record', () => {
  beforeAll(() => {
    // performance is left alone, so the time spent is real.
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'], now: FIXED_NOW });
    process.on('unhandledRejection', onAsyncError);
    // Expression errors are reported on the console for every evaluation; the recording is what matters here.
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    process.off('unhandledRejection', onAsyncError);
    vi.useRealTimers();
    vi.restoreAllMocks();
    if (!OUT) return;
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(
      OUT,
      JSON.stringify({
        meta: {
          label: process.env.FORM_COMPARISON_LABEL,
          ref: process.env.FORM_COMPARISON_REF,
          commit: process.env.FORM_COMPARISON_COMMIT,
          forms: FORMS_DIR,
          filter: FILTER,
          seeds: SEEDS,
          steps: STEPS,
          maxAnswers: MAX_ANSWERS_PER_PASS,
          onlyExpressions: ONLY_EXPRESSIONS,
          allLanguages: ALL_LANGUAGES,
        },
        forms: results,
      })
    );
  });

  it('has a folder of forms', () => {
    if (allFiles.length === 0) throw new Error(`No forms found in "${FORMS_DIR}". Start through run.mjs.`);
  });

  it.each(files.map(file => [relativeName(file), file]))('%s', async (name, file) => {
    let questionnaires: Questionnaire[];
    try {
      questionnaires = extractQuestionnaires(readJson(file));
    } catch (error) {
      results[name] = { questionnaires: [], error: `Could not read: ${String(error)}` };
      return;
    }
    // A bundle holds the same form in several languages; the first is enough unless asked for all.
    const relevant = questionnaires
      .map((questionnaire, index) => ({
        questionnaire,
        id: `${index}:${questionnaire.id ?? ''}`,
        expressions: countExpressions(questionnaire),
      }))
      .filter((entry, index) => (ALL_LANGUAGES || index === 0) && (!ONLY_EXPRESSIONS || entry.expressions > 0));
    if (relevant.length === 0) return;
    const result: FormResult = { questionnaires: [] };
    for (const { questionnaire, id, expressions } of relevant) {
      const runs: Run[] = [];
      for (const [optionName, options] of OPTION_SETS) {
        // The store freezes what it is given, and a frozen questionnaire cannot always be loaded again; every run
        // gets its own copy, as a page load does.
        for (const seed of SEEDS) runs.push(await record(structuredClone(questionnaire), optionName, options, seed));
      }
      result.questionnaires.push({ id, expressions, runs });
    }
    results[name] = result;
  });
});
