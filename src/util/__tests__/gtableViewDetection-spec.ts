import { describe, it, expect } from 'vitest';

import type { QuestionnaireItem } from 'fhir/r4';

import { isGTableView, isLegacyGTable } from '../extension';

const gtable = {
  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
  valueCodeableConcept: { coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code: 'gtable' }] },
};
const copy = (expression: string): QuestionnaireItem['extension'] => [
  { url: 'http://hl7.org/fhir/StructureDefinition/cqf-expression', valueExpression: { language: 'text/fhirpath', expression } },
];
const question = (linkId: string, extension?: QuestionnaireItem['extension']): QuestionnaireItem => ({
  linkId,
  type: 'string',
  ...(extension && { extension }),
});

const copied: QuestionnaireItem = {
  linkId: 'kopi',
  type: 'group',
  repeats: true,
  extension: [...(copy("%resource.descendants().where(linkId='medisin')") ?? []), gtable],
  item: [question('kopi.navn', copy("%row.descendants().where(linkId='medisin.navn').answer.value"))],
};
const filledIn: QuestionnaireItem = { linkId: 'egen', type: 'group', repeats: true, extension: [gtable], item: [question('egen.navn')] };
const legacy: QuestionnaireItem = {
  linkId: 'gammel',
  type: 'group',
  repeats: true,
  extension: [gtable],
  item: [question('gammel.navn', copy("QuestionnaireResponse.descendants().where(linkId='medisin.navn').answer.value"))],
};

describe('gtable as a view', () => {
  it('is a copied group with gtable', () => {
    expect(isGTableView(copied)).toBe(true);
    expect(isLegacyGTable(copied)).toBe(false);
  });

  it('is a repeating group with gtable that the person fills in', () => {
    expect(isGTableView(filledIn)).toBe(true);
    expect(isGTableView({ ...filledIn, repeats: false })).toBe(false);
  });

  it('is not an old gtable: no row source on the group, columns with copy expressions (also when the group repeats)', () => {
    expect(isLegacyGTable(legacy)).toBe(true);
    expect(isGTableView(legacy)).toBe(false);
    expect(isLegacyGTable({ ...legacy, repeats: false })).toBe(true);
  });

  it('is not a group without gtable', () => {
    expect(isGTableView({ ...filledIn, extension: [] })).toBe(false);
  });
});
