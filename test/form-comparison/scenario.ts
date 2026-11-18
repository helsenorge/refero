import type {
  Bundle,
  Coding,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
  ValueSet,
} from 'fhir/r4';

/**
 * Decides how a form is filled in: which question is answered with what, which group is repeated or removed.
 * The same seed gives the same choices every time, and nothing in here uses the refero code under test, so two
 * implementations are asked to do exactly the same thing.
 */

const CALCULATED_EXPRESSION = 'http://ehelse.no/fhir/StructureDefinition/sdf-calculatedExpression';
const COPY_EXPRESSION = 'http://hl7.org/fhir/StructureDefinition/cqf-expression';
const UNIT = 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit';
const MAX_OCCURRENCES = 4;

export type Rng = () => number;

export function createRng(seed: number): Rng {
  let state = seed >>> 0 || 1;
  return () => {
    state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff;
    return state / 0x80000000;
  };
}

/** FNV-1a; short, stable and without dependencies. */
export function hash(value: unknown): string {
  const text = JSON.stringify(value) ?? 'undefined';
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

/** The questionnaires in a file: the resource itself, or every Questionnaire in a Bundle. */
export function extractQuestionnaires(json: unknown): Questionnaire[] {
  const resource = json as Questionnaire | Bundle | undefined;
  if (resource?.resourceType === 'Questionnaire') return [resource];
  if (resource?.resourceType === 'Bundle') {
    return (resource.entry ?? []).map(entry => entry.resource).filter((r): r is Questionnaire => r?.resourceType === 'Questionnaire');
  }
  return [];
}

function isCalculated(item: QuestionnaireItem): boolean {
  return (item.extension ?? []).some(extension => extension.url === CALCULATED_EXPRESSION || extension.url === COPY_EXPRESSION);
}

export function indexQuestionnaire(questionnaire: Questionnaire): Map<string, QuestionnaireItem> {
  const definitions = new Map<string, QuestionnaireItem>();
  (function walk(items: QuestionnaireItem[] = []): void {
    for (const item of items) {
      definitions.set(item.linkId, item);
      walk(item.item);
    }
  })(questionnaire.item);
  return definitions;
}

export function countExpressions(questionnaire: Questionnaire): number {
  return [...indexQuestionnaire(questionnaire).values()].filter(isCalculated).length;
}

export interface Occurrence {
  item: QuestionnaireResponseItem;
  /** Which occurrence of the linkId this is in the whole response, in document order. */
  number: number;
  siblings: QuestionnaireResponseItem[];
  definition?: QuestionnaireItem;
}

/** Every item in the response, in document order, including items nested under answers. */
export function occurrences(qr: QuestionnaireResponse | null | undefined, definitions?: Map<string, QuestionnaireItem>): Occurrence[] {
  const found: Occurrence[] = [];
  const seen = new Map<string, number>();
  (function walk(items: QuestionnaireResponseItem[] = []): void {
    for (const item of items) {
      const number = seen.get(item.linkId) ?? 0;
      seen.set(item.linkId, number + 1);
      found.push({ item, number, siblings: items, definition: definitions?.get(item.linkId) });
      walk(item.item);
      for (const answer of item.answer ?? []) walk(answer.item);
    }
  })(qr?.item ?? []);
  return found;
}

function codings(questionnaire: Questionnaire, definition: QuestionnaireItem): Coding[] {
  if (definition.answerOption?.length) {
    return definition.answerOption.map(option => option.valueCoding).filter((coding): coding is Coding => !!coding);
  }
  const reference = definition.answerValueSet;
  if (!reference?.startsWith('#')) return [];
  const valueSet = (questionnaire.contained ?? []).find(
    (resource): resource is ValueSet => resource.resourceType === 'ValueSet' && resource.id === reference.slice(1)
  );
  return [
    ...(valueSet?.compose?.include ?? []).flatMap(include =>
      (include.concept ?? []).map(concept => ({ system: include.system, code: concept.code, display: concept.display }))
    ),
    ...(valueSet?.expansion?.contains ?? []).map(contains => ({ system: contains.system, code: contains.code, display: contains.display })),
  ];
}

function randomAnswer(
  rng: Rng,
  questionnaire: Questionnaire,
  definition: QuestionnaireItem
): QuestionnaireResponseItemAnswer[] | undefined {
  const pick = <T>(list: T[]): T => list[Math.floor(rng() * list.length)];
  const twoDigits = (n: number): string => String(n).padStart(2, '0');
  const date = (): string =>
    `${1950 + Math.floor(rng() * 80)}-${twoDigits(1 + Math.floor(rng() * 12))}-${twoDigits(1 + Math.floor(rng() * 28))}`;
  switch (definition.type) {
    case 'integer':
      return [{ valueInteger: Math.floor(rng() * 34) - 3 }];
    case 'decimal':
      return [{ valueDecimal: Math.round(rng() * 2000 - 100) / 10 }];
    case 'quantity': {
      const unit = (definition.extension ?? []).find(extension => extension.url === UNIT)?.valueCoding;
      return [
        {
          valueQuantity: {
            value: Math.round(rng() * 2000) / 10,
            ...(unit && { unit: unit.display, system: unit.system, code: unit.code }),
          },
        },
      ];
    }
    case 'boolean':
      return [{ valueBoolean: rng() < 0.5 }];
    case 'string':
    case 'text':
      return [{ valueString: pick(['a', '12', '3.5', 'Test Testesen', '0']) }];
    case 'date':
      return [{ valueDate: date() }];
    case 'dateTime':
      return [{ valueDateTime: `${date()}T${twoDigits(Math.floor(rng() * 24))}:00:00+01:00` }];
    case 'time':
      return [{ valueTime: `${twoDigits(Math.floor(rng() * 24))}:${twoDigits(Math.floor(rng() * 60))}:00` }];
    case 'choice':
    case 'open-choice': {
      const available = codings(questionnaire, definition);
      if (available.length === 0) return undefined;
      const first = pick(available);
      const second = pick(available);
      return (definition.repeats && second !== first && rng() < 0.5 ? [first, second] : [first]).map(valueCoding => ({ valueCoding }));
    }
    default:
      return undefined;
  }
}

/**
 * Read-only questions without an expression are answered as well: in production they are filled in from the
 * outside (prefill), and much of a form can depend on them.
 */
function isAnswerable(definition: QuestionnaireItem | undefined): definition is QuestionnaireItem {
  return !!definition && !isCalculated(definition) && !['group', 'display', 'attachment', 'reference', 'url'].includes(definition.type);
}

/** Something a user does to the form. linkId and number point out the occurrence, see Occurrence. */
export type Edit =
  | { kind: 'answer'; linkId: string; number: number; answer: QuestionnaireResponseItemAnswer[] }
  | { kind: 'clear'; linkId: string; number: number }
  | { kind: 'addRepeat'; linkId: string; number: number }
  | { kind: 'removeRepeat'; linkId: string; number: number };

export function describeEdit(edit: Edit): string {
  return `${edit.kind} ${edit.linkId}[${edit.number}]`;
}

interface Gate {
  linkId: string;
  answer: QuestionnaireResponseItemAnswer[];
}

/**
 * The answers that show other parts of the form: one for every enableWhen that compares a question with a
 * value. Without these most of a form with many conditions stays hidden, and nothing in it is exercised.
 */
function gates(definitions: Map<string, QuestionnaireItem>): Gate[] {
  const found: Gate[] = [];
  for (const definition of definitions.values()) {
    for (const condition of definition.enableWhen ?? []) {
      // The value compared with satisfies =, >= and <=.
      if (!['=', '>=', '<='].includes(condition.operator) || !isAnswerable(definitions.get(condition.question))) continue;
      const answer: QuestionnaireResponseItemAnswer | undefined =
        condition.answerCoding !== undefined
          ? { valueCoding: condition.answerCoding }
          : condition.answerBoolean !== undefined
            ? { valueBoolean: condition.answerBoolean }
            : condition.answerInteger !== undefined
              ? { valueInteger: condition.answerInteger }
              : condition.answerDecimal !== undefined
                ? { valueDecimal: condition.answerDecimal }
                : condition.answerString !== undefined
                  ? { valueString: condition.answerString }
                  : condition.answerDate !== undefined
                    ? { valueDate: condition.answerDate }
                    : undefined;
      if (answer) found.push({ linkId: condition.question, answer: [answer] });
    }
  }
  return found;
}

/** For every question something depends on, one of the answers that shows more of the form. */
export function openGates(rng: Rng, qr: QuestionnaireResponse | null | undefined, definitions: Map<string, QuestionnaireItem>): Edit[] {
  const byQuestion = new Map<string, Gate[]>();
  for (const gate of gates(definitions)) byQuestion.set(gate.linkId, [...(byQuestion.get(gate.linkId) ?? []), gate]);
  const edits: Edit[] = [];
  for (const occurrence of occurrences(qr)) {
    const candidates = byQuestion.get(occurrence.item.linkId);
    if (!candidates) continue;
    const gate = candidates[Math.floor(rng() * candidates.length)];
    edits.push({ kind: 'answer', linkId: gate.linkId, number: occurrence.number, answer: gate.answer });
  }
  return edits;
}

/** One change, chosen among what the response holds right now. */
export function randomEdit(
  rng: Rng,
  questionnaire: Questionnaire,
  qr: QuestionnaireResponse | null | undefined,
  definitions: Map<string, QuestionnaireItem>
): Edit | undefined {
  const all = occurrences(qr, definitions);
  const kind = rng();

  if (kind < 0.12) {
    const repeating = all.filter(o => o.definition?.repeats && o.definition.type !== 'choice' && o.definition.type !== 'open-choice');
    if (repeating.length > 0) {
      const target = repeating[Math.floor(rng() * repeating.length)];
      const same = target.siblings.filter(sibling => sibling.linkId === target.item.linkId);
      const last = all.find(o => o.item === same[same.length - 1]) ?? target;
      if (same.length > 1 && (same.length >= MAX_OCCURRENCES || rng() < 0.4)) {
        return { kind: 'removeRepeat', linkId: last.item.linkId, number: last.number };
      }
      return { kind: 'addRepeat', linkId: target.item.linkId, number: target.number };
    }
  }

  if (kind < 0.35) {
    const candidates = gates(definitions);
    if (candidates.length > 0) {
      const gate = candidates[Math.floor(rng() * candidates.length)];
      const targets = all.filter(o => o.item.linkId === gate.linkId);
      if (targets.length > 0) {
        const target = targets[Math.floor(rng() * targets.length)];
        return { kind: 'answer', linkId: gate.linkId, number: target.number, answer: gate.answer };
      }
    }
  }

  const answerable = all.filter(o => isAnswerable(o.definition));
  if (answerable.length === 0) return undefined;
  const target = answerable[Math.floor(rng() * answerable.length)];
  if (kind > 0.85) return { kind: 'clear', linkId: target.item.linkId, number: target.number };
  const answer = randomAnswer(rng, questionnaire, target.definition as QuestionnaireItem);
  return answer && { kind: 'answer', linkId: target.item.linkId, number: target.number, answer };
}

const hasValue = (item: QuestionnaireResponseItem): boolean =>
  (item.answer ?? []).some(answer => Object.keys(answer).some(key => key.startsWith('value')));

/**
 * An answer for every question that has none, so everything in the form has something to work on. Questions
 * that are not shown lose the answer again; call it once more to reach the ones the first round opened up.
 */
export function answerEverything(
  rng: Rng,
  questionnaire: Questionnaire,
  qr: QuestionnaireResponse | null | undefined,
  definitions: Map<string, QuestionnaireItem>
): Edit[] {
  const edits: Edit[] = [];
  for (const occurrence of occurrences(qr, definitions)) {
    if (!isAnswerable(occurrence.definition) || hasValue(occurrence.item)) continue;
    // Mostly yes, since yes is what usually opens up more of a form.
    const answer =
      occurrence.definition.type === 'boolean' ? [{ valueBoolean: rng() < 0.8 }] : randomAnswer(rng, questionnaire, occurrence.definition);
    if (answer) edits.push({ kind: 'answer', linkId: occurrence.item.linkId, number: occurrence.number, answer });
  }
  return edits;
}
