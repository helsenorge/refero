import { describe, test, expect, beforeEach, vi, Mock } from 'vitest';

import type {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItemAnswer,
  Extension,
  Coding,
  Quantity,
  Attachment,
} from 'fhir/r4';

// -------------------- Mocks --------------------

// 1) fhirpath resolver: vi styrer output pr test
import { FhirPathExtensions } from '../FhirPathExtensions';
vi.mock('../fhirpathHelper', () => ({
  evaluateFhirpathExpressionToGetString: vi.fn(),
}));
import { evaluateFhirpathExpressionToGetString } from '../fhirpathHelper';

// 2) Extensions: vi trenger bare URL konstanten
vi.mock('@/constants/extensions', () => ({
  Extensions: {
    CALCULATED_EXPRESSION_URL: 'http://hl7.org/fhir/StructureDefinition/cqf-expression',
  },
}));
import { Extensions } from '@/constants/extensions';
import ItemType from '@/constants/itemType';

// 3) Unit helper til Quantity
vi.mock('../extension', () => {
  const CQF = 'http://hl7.org/fhir/StructureDefinition/cqf-expression';
  return {
    getQuestionnaireUnitExtensionValue: vi.fn(() => ({
      system: 'http://unit.test',
      code: 'u',
      display: 'U',
    })),
    // ⬇️ returner calculatedExpression-extension fra itemet
    getCalculatedExpressionExtension: vi.fn((item: QuestionnaireItem) => item.extension?.find(e => e.url === CQF)),
    getCopyExtension: vi.fn(() => undefined),
  };
});

// 4) Quantity typeguard: la den returnere false så createQuantity brukes
vi.mock('../typeguards', () => ({
  isQuantity: vi.fn(() => false),
}));

// 5) getDecimalValue: bruk identity for enkel verifisering
vi.mock('../index', () => ({
  getDecimalValue: (_: QuestionnaireItem, n?: number): number | undefined => n,
}));

// -------------------- helpers --------------------

const calcExt = (valueString: string): Extension => ({
  url: Extensions.CALCULATED_EXPRESSION_URL,
  valueString,
});

const mkQ = (qi: QuestionnaireItem): Questionnaire => ({
  resourceType: 'Questionnaire',
  status: 'draft',
  item: [qi],
});

const mkQR = (linkId: string, answers?: QuestionnaireResponseItemAnswer[]): QuestionnaireResponse => ({
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [{ linkId, ...(answers ? { answer: answers } : {}) }],
});

const firstAns = (qr: QuestionnaireResponse, linkId: string): QuestionnaireResponseItemAnswer | undefined =>
  qr.item?.find(i => i.linkId === linkId)?.answer?.[0];

// -------------------- testdata fabrikk --------------------

const BOOLEAN_ITEM = (): QuestionnaireItem => ({
  linkId: 'bool',
  text: 'boolean',
  type: ItemType.BOOLEAN,
  extension: [calcExt('expr_bool')],
});

const DECIMAL_ITEM = (): QuestionnaireItem => ({
  linkId: 'dec',
  text: 'decimal',
  type: ItemType.DECIMAL,
  extension: [calcExt('expr_dec')],
});

const INTEGER_ITEM = (): QuestionnaireItem => ({
  linkId: 'int',
  text: 'integer',
  type: ItemType.INTEGER,
  extension: [calcExt('expr_int')],
});

const DATE_ITEM = (): QuestionnaireItem => ({
  linkId: 'date',
  text: 'date',
  type: ItemType.DATE,
  extension: [calcExt('expr_date')],
});

const DATETIME_ITEM = (): QuestionnaireItem => ({
  linkId: 'dt',
  text: 'datetime',
  type: ItemType.DATETIME,
  extension: [calcExt('expr_dt')],
});

const TIME_ITEM = (): QuestionnaireItem => ({
  linkId: 'time',
  text: 'time',
  type: ItemType.TIME,
  extension: [calcExt('expr_time')],
});

const STRING_ITEM = (): QuestionnaireItem => ({
  linkId: 'str',
  text: 'string',
  type: ItemType.STRING,
  extension: [calcExt('expr_str')],
});

const TEXT_ITEM = (): QuestionnaireItem => ({
  linkId: 'txt',
  text: 'text',
  type: ItemType.TEXT,
  extension: [calcExt('expr_txt')],
});

const CHOICE_ITEM = (): QuestionnaireItem => ({
  linkId: 'choice',
  text: 'choice',
  type: ItemType.CHOICE,
  extension: [calcExt('expr_choice')],
});

const OPENCHOICE_ITEM = (): QuestionnaireItem => ({
  linkId: 'openchoice',
  text: 'openchoice',
  type: ItemType.OPENCHOICE,
  extension: [calcExt('expr_openchoice')],
});

const QUANTITY_ITEM = (): QuestionnaireItem => ({
  linkId: 'qty',
  text: 'quantity',
  type: ItemType.QUANTITY,
  extension: [calcExt('expr_qty')],
});

const ATTACHMENT_ITEM = (): QuestionnaireItem => ({
  linkId: 'att',
  text: 'attachment',
  type: ItemType.ATTATCHMENT,
  extension: [calcExt('expr_att')],
});

// -------------------- tests --------------------

describe('evaluateAllExpressions — value[x] with/without value from mock', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // boolean — with value
  test('BOOLEAN: mock [true] -> valueBoolean true', () => {
    (evaluateFhirpathExpressionToGetString as Mock).mockReturnValue([true]);

    const qi = BOOLEAN_ITEM();
    const q = mkQ(qi);
    const qr = mkQR('bool');

    const ext = new FhirPathExtensions(q);
    const out = ext.evaluateAllExpressions(qr);

    const ans = firstAns(out, 'bool');
    expect(ans).toBeDefined();
    expect(ans?.valueBoolean).toBe(true);
  });

  // boolean — without value (empty) => must produce false (always answer)
  test('BOOLEAN: mock [] -> valueBoolean false (always present)', () => {
    (evaluateFhirpathExpressionToGetString as Mock).mockReturnValue([]);

    const qi = BOOLEAN_ITEM();
    const q = mkQ(qi);
    // Legg til eksisterende svar true for å bekrefte at false overstyrer
    const qr = mkQR('bool', [{ valueBoolean: true }]);

    const ext = new FhirPathExtensions(q);
    const out = ext.evaluateAllExpressions(qr);

    const ans = firstAns(out, 'bool');
    expect(ans).toBeDefined();
    expect(ans?.valueBoolean).toBe(false);
  });

  // decimal — with value
  test('DECIMAL: mock [3.14] -> valueDecimal 3.14', () => {
    (evaluateFhirpathExpressionToGetString as Mock).mockReturnValue([3.14]);

    const qi = DECIMAL_ITEM();
    const q = mkQ(qi);
    const qr = mkQR('dec');

    const ext = new FhirPathExtensions(q);
    const out = ext.evaluateAllExpressions(qr);

    expect(firstAns(out, 'dec')?.valueDecimal).toBe(3.14);
  });

  // decimal — no value => keep existing
  test('DECIMAL: mock [] -> beholder eksisterende answer', () => {
    (evaluateFhirpathExpressionToGetString as Mock).mockReturnValue([]);

    const qi = DECIMAL_ITEM();
    const q = mkQ(qi);
    const existing = { valueDecimal: 1.23 };
    const qr = mkQR('dec', [existing]);

    const ext = new FhirPathExtensions(q);
    const out = ext.evaluateAllExpressions(qr);

    expect(firstAns(out, 'dec')).toMatchObject(existing);
  });
  test('DECIMAL: mock [] -> ny verdi er tom', () => {
    (evaluateFhirpathExpressionToGetString as Mock).mockReturnValue([]);

    const qi = DECIMAL_ITEM();
    const q = mkQ(qi);
    const qr = mkQR('dec');

    const ext = new FhirPathExtensions(q);
    const out = ext.evaluateAllExpressions(qr);

    expect(firstAns(out, 'dec')?.valueDecimal).toBe(undefined);
  });

  test('INTEGER: mock [] -> valueInteger undefined', () => {
    (evaluateFhirpathExpressionToGetString as Mock).mockReturnValue([]);

    const qi = INTEGER_ITEM();
    const q = mkQ(qi);
    const qr = mkQR('int');

    const ext = new FhirPathExtensions(q);
    const out = ext.evaluateAllExpressions(qr);

    expect(firstAns(out, 'int')?.valueInteger).toBe(undefined);
  });

  // integer — with value
  test('INTEGER: mock ["2.6"] -> valueInteger 3 (rounded)', () => {
    (evaluateFhirpathExpressionToGetString as Mock).mockReturnValue(['2.6']);

    const qi = INTEGER_ITEM();
    const q = mkQ(qi);
    const qr = mkQR('int');

    const ext = new FhirPathExtensions(q);
    const out = ext.evaluateAllExpressions(qr);

    expect(firstAns(out, 'int')?.valueInteger).toBe(3);
  });

  // integer — no value => keep existing
  test('INTEGER: mock [] -> beholder eksisterende answer', () => {
    (evaluateFhirpathExpressionToGetString as Mock).mockReturnValue([]);

    const qi = INTEGER_ITEM();
    const q = mkQ(qi);
    const existing = { valueInteger: 9 };
    const qr = mkQR('int', [existing]);

    const ext = new FhirPathExtensions(q);
    const out = ext.evaluateAllExpressions(qr);

    expect(firstAns(out, 'int')).toMatchObject(existing);
  });

  // date — with no value
  test('DATE: mock [] -> valueDate ""', () => {
    (evaluateFhirpathExpressionToGetString as Mock).mockReturnValue([]);

    const qi = DATE_ITEM();
    const q = mkQ(qi);
    const qr = mkQR('date');

    const ext = new FhirPathExtensions(q);
    const out = ext.evaluateAllExpressions(qr);

    expect(firstAns(out, 'date')?.valueDate).toBe(undefined);
  });
  // date — with value
  test('DATE: mock ["2025-01-02"] -> valueDate "2025-01-02"', () => {
    (evaluateFhirpathExpressionToGetString as Mock).mockReturnValue(['2025-01-02']);

    const qi = DATE_ITEM();
    const q = mkQ(qi);
    const qr = mkQR('date');

    const ext = new FhirPathExtensions(q);
    const out = ext.evaluateAllExpressions(qr);

    expect(firstAns(out, 'date')?.valueDate).toBe('2025-01-02');
  });

  // date — no value => keep existing
  test('DATE: mock [] -> beholder eksisterende answer', () => {
    (evaluateFhirpathExpressionToGetString as Mock).mockReturnValue([]);

    const qi = DATE_ITEM();
    const q = mkQ(qi);
    const existing = { valueDate: '2020-12-24' };
    const qr = mkQR('date', [existing]);

    const ext = new FhirPathExtensions(q);
    const out = ext.evaluateAllExpressions(qr);

    expect(firstAns(out, 'date')).toMatchObject(existing);
  });

  // dateTime — with value
  test('DATETIME: mock ["2025-01-02T10:11:12Z"] -> valueDateTime', () => {
    (evaluateFhirpathExpressionToGetString as Mock).mockReturnValue(['2025-01-02T10:11:12Z']);

    const qi = DATETIME_ITEM();
    const q = mkQ(qi);
    const qr = mkQR('dt');

    const ext = new FhirPathExtensions(q);
    const out = ext.evaluateAllExpressions(qr);

    expect(firstAns(out, 'dt')?.valueDateTime).toBe('2025-01-02T10:11:12Z');
  });

  // dateTime — no value => keep existing
  test('DATETIME: mock [] -> beholder eksisterende answer', () => {
    (evaluateFhirpathExpressionToGetString as Mock).mockReturnValue([]);

    const qi = DATETIME_ITEM();
    const q = mkQ(qi);
    const existing = { valueDateTime: '2020-01-01T00:00:00Z' };
    const qr = mkQR('dt', [existing]);

    const ext = new FhirPathExtensions(q);
    const out = ext.evaluateAllExpressions(qr);

    expect(firstAns(out, 'dt')).toMatchObject(existing);
  });

  // time — with value
  test('TIME: mock ["10:11:12"] -> valueTime "10:11:12"', () => {
    (evaluateFhirpathExpressionToGetString as Mock).mockReturnValue(['10:11:12']);

    const qi = TIME_ITEM();
    const q = mkQ(qi);
    const qr = mkQR('time');

    const ext = new FhirPathExtensions(q);
    const out = ext.evaluateAllExpressions(qr);

    expect(firstAns(out, 'time')?.valueTime).toBe('10:11:12');
  });

  // time — no value => keep existing
  test('TIME: mock [] -> beholder eksisterende answer', () => {
    (evaluateFhirpathExpressionToGetString as Mock).mockReturnValue([]);

    const qi = TIME_ITEM();
    const q = mkQ(qi);
    const existing = { valueTime: '08:00:00' };
    const qr = mkQR('time', [existing]);

    const ext = new FhirPathExtensions(q);
    const out = ext.evaluateAllExpressions(qr);

    expect(firstAns(out, 'time')).toMatchObject(existing);
  });

  //string — empty value => undefined
  test('STRING: mock [] -> valueString ""', () => {
    (evaluateFhirpathExpressionToGetString as Mock).mockReturnValue([]);

    const qi = STRING_ITEM();
    const q = mkQ(qi);
    const qr = mkQR('str');

    const ext = new FhirPathExtensions(q);
    const out = ext.evaluateAllExpressions(qr);

    expect(firstAns(out, 'str')?.valueString).toBe(undefined);
  });

  // string — with value
  test('STRING: mock ["abc"] -> valueString "abc"', () => {
    (evaluateFhirpathExpressionToGetString as Mock).mockReturnValue(['abc']);

    const qi = STRING_ITEM();
    const q = mkQ(qi);
    const qr = mkQR('str');

    const ext = new FhirPathExtensions(q);
    const out = ext.evaluateAllExpressions(qr);

    expect(firstAns(out, 'str')?.valueString).toBe('abc');
  });

  // string — no value => keep existing
  test('STRING: mock [] -> beholder eksisterende answer', () => {
    (evaluateFhirpathExpressionToGetString as Mock).mockReturnValue([]);

    const qi = STRING_ITEM();
    const q = mkQ(qi);
    const existing = { valueString: 'prev' };
    const qr = mkQR('str', [existing]);

    const ext = new FhirPathExtensions(q);
    const out = ext.evaluateAllExpressions(qr);

    expect(firstAns(out, 'str')).toMatchObject(existing);
  });

  // text — empty value => undefined
  test('TEXT: mock [] -> valueString ""', () => {
    (evaluateFhirpathExpressionToGetString as Mock).mockReturnValue([]);

    const qi = TEXT_ITEM();
    const q = mkQ(qi);
    const qr = mkQR('txt');

    const ext = new FhirPathExtensions(q);
    const out = ext.evaluateAllExpressions(qr);

    expect(firstAns(out, 'txt')?.valueString).toBe(undefined);
  });

  // text — with value
  test('TEXT: mock ["lorem"] -> valueString "lorem"', () => {
    (evaluateFhirpathExpressionToGetString as Mock).mockReturnValue(['lorem']);

    const qi = TEXT_ITEM();
    const q = mkQ(qi);
    const qr = mkQR('txt');

    const ext = new FhirPathExtensions(q);
    const out = ext.evaluateAllExpressions(qr);

    expect(firstAns(out, 'txt')?.valueString).toBe('lorem');
  });

  // text — no value => keep existing
  test('TEXT: mock [] -> beholder eksisterende answer', () => {
    (evaluateFhirpathExpressionToGetString as Mock).mockReturnValue([]);

    const qi = TEXT_ITEM();
    const q = mkQ(qi);
    const existing = { valueString: 'old text' };
    const qr = mkQR('txt', [existing]);

    const ext = new FhirPathExtensions(q);
    const out = ext.evaluateAllExpressions(qr);

    expect(firstAns(out, 'txt')).toMatchObject(existing);
  });

  // choice - empty value => undefined
  test('CHOICE: mock [] -> valueCoding undefined', () => {
    (evaluateFhirpathExpressionToGetString as Mock).mockReturnValue([]);

    const qi = CHOICE_ITEM();
    const q = mkQ(qi);
    const qr = mkQR('choice');

    const ext = new FhirPathExtensions(q);
    const out = ext.evaluateAllExpressions(qr);

    expect(firstAns(out, 'choice')?.valueCoding).toBe(undefined);
  });
  // choice — with valueCoding
  test('CHOICE: mock [Coding] -> valueCoding settes', () => {
    const coding: Coding = { system: 's', code: 'c', display: 'd' };
    (evaluateFhirpathExpressionToGetString as Mock).mockReturnValue([coding]);

    const qi = CHOICE_ITEM();
    const q = mkQ(qi);
    const qr = mkQR('choice');

    const ext = new FhirPathExtensions(q);
    const out = ext.evaluateAllExpressions(qr);

    expect(firstAns(out, 'choice')?.valueCoding).toMatchObject(coding);
  });

  // choice — no value => keep existing
  test('CHOICE: mock [] -> beholder eksisterende valueCoding', () => {
    (evaluateFhirpathExpressionToGetString as Mock).mockReturnValue([]);

    const qi = CHOICE_ITEM();
    const q = mkQ(qi);
    const existing = { valueCoding: { system: 's2', code: 'c2', display: 'd2' } };
    const qr = mkQR('choice', [existing]);

    const ext = new FhirPathExtensions(q);
    const out = ext.evaluateAllExpressions(qr);

    expect(firstAns(out, 'choice')).toMatchObject(existing);
  });

  //openchoice - empty value => undefined
  test('OPENCHOICE: mock [] -> valueCoding undefined', () => {
    (evaluateFhirpathExpressionToGetString as Mock).mockReturnValue([]);

    const qi = OPENCHOICE_ITEM();
    const q = mkQ(qi);
    const qr = mkQR('openchoice');

    const ext = new FhirPathExtensions(q);
    const out = ext.evaluateAllExpressions(qr);

    expect(firstAns(out, 'openchoice')?.valueCoding).toBe(undefined);
  });

  // openchoice — with valueCoding
  test('OPENCHOICE: mock [Coding] -> valueCoding settes', () => {
    const coding: Coding = { system: 's', code: 'c', display: 'd' };
    (evaluateFhirpathExpressionToGetString as Mock).mockReturnValue([coding]);

    const qi = OPENCHOICE_ITEM();
    const q = mkQ(qi);
    const qr = mkQR('openchoice');

    const ext = new FhirPathExtensions(q);
    const out = ext.evaluateAllExpressions(qr);

    expect(firstAns(out, 'openchoice')?.valueCoding).toMatchObject(coding);
  });

  // openchoice — no value => keep existing
  test('OPENCHOICE: mock [] -> beholder eksisterende valueCoding', () => {
    (evaluateFhirpathExpressionToGetString as Mock).mockReturnValue([]);

    const qi = OPENCHOICE_ITEM();
    const q = mkQ(qi);
    const existing = { valueCoding: { system: 'S', code: 'X', display: 'DX' } };
    const qr = mkQR('openchoice', [existing]);

    const ext = new FhirPathExtensions(q);
    const out = ext.evaluateAllExpressions(qr);

    expect(firstAns(out, 'openchoice')).toMatchObject(existing);
  });

  // quantity — with primitive value -> createQuantity uten unit
  test('QUANTITY: mock [5] -> valueQuantity uten unit fra extension', () => {
    (evaluateFhirpathExpressionToGetString as Mock).mockReturnValue([]);

    const qi = QUANTITY_ITEM();
    const q = mkQ(qi);
    const qr = mkQR('qty');

    const ext = new FhirPathExtensions(q);
    const out = ext.evaluateAllExpressions(qr);

    const vq = firstAns(out, 'qty')?.valueQuantity as Quantity;
    expect(vq).toBeUndefined();
  });

  // quantity — with primitive value -> createQuantity + unit
  test('QUANTITY: mock [5] -> valueQuantity med unit fra extension', () => {
    (evaluateFhirpathExpressionToGetString as Mock).mockReturnValue([5]);

    const qi = QUANTITY_ITEM();
    const q = mkQ(qi);
    const qr = mkQR('qty');

    const ext = new FhirPathExtensions(q);
    const out = ext.evaluateAllExpressions(qr);

    const vq = firstAns(out, 'qty')?.valueQuantity as Quantity;
    expect(vq).toBeDefined();
    expect(vq.unit).toBe('U');
    expect(vq.system).toBe('http://unit.test');
    expect(vq.code).toBe('u');
    expect(vq.value).toBe(5);
  });

  // quantity — no value => keep existing
  test('QUANTITY: mock [] -> beholder eksisterende quantity', () => {
    (evaluateFhirpathExpressionToGetString as Mock).mockReturnValue([]);

    const qi = QUANTITY_ITEM();
    const q = mkQ(qi);
    const existing: QuestionnaireResponseItemAnswer = {
      valueQuantity: { value: 1, unit: 'kg', system: 'ucum', code: 'kg' },
    };
    const qr = mkQR('qty', [existing]);

    const ext = new FhirPathExtensions(q);
    const out = ext.evaluateAllExpressions(qr);

    expect(firstAns(out, 'qty')).toMatchObject(existing);
  });

  // attachment — with value
  test('ATTACHMENT: mock [Attachment] -> valueAttachment settes', () => {
    const att: Attachment = { url: 'http://file', title: 'f' };
    (evaluateFhirpathExpressionToGetString as Mock).mockReturnValue([att]);

    const qi = ATTACHMENT_ITEM();
    const q = mkQ(qi);
    const qr = mkQR('att');

    const ext = new FhirPathExtensions(q);
    const out = ext.evaluateAllExpressions(qr);

    expect(firstAns(out, 'att')?.valueAttachment).toMatchObject(att);
  });

  // attachment — no value => keep existing
  test('ATTACHMENT: mock [] -> beholder eksisterende attachment', () => {
    (evaluateFhirpathExpressionToGetString as Mock).mockReturnValue([]);

    const qi = ATTACHMENT_ITEM();
    const q = mkQ(qi);
    const existing: QuestionnaireResponseItemAnswer = { valueAttachment: { url: 'prev://a', title: 'old' } };
    const qr = mkQR('att', [existing]);

    const ext = new FhirPathExtensions(q);
    const out = ext.evaluateAllExpressions(qr);

    expect(firstAns(out, 'att')).toMatchObject(existing);
  });
});
