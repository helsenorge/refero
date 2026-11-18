import type { Extension, Questionnaire, QuestionnaireItem } from 'fhir/r4';

/**
 * Test form for calculation performance: `?q=perf&n=200` in the preview builds a form with n calculations
 * over a fixed set of inputs, so the same measurement can be repeated at different sizes.
 *
 * The calculations cycle through the kinds real forms use:
 * - copy: cqf-expression copying one input (value copy)
 * - sum: calculatedExpression summing one input group
 * - chain: calculatedExpression reading the previous calculation (a dependency chain)
 * Optional `rows=1` adds a repeating group shown through an item copy gtable.
 */
const CQF = 'http://hl7.org/fhir/StructureDefinition/cqf-expression';
const CALCULATED = 'http://ehelse.no/fhir/StructureDefinition/sdf-calculatedExpression';
const GROUPS = 20;
const QUESTIONS_PER_GROUP = 10;

const itemControl = (code: string): Extension => ({
  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
  valueCodeableConcept: { coding: [{ system: 'http://hl7.org/fhir/ValueSet/questionnaire-item-control', code }] },
});

function calculation(index: number): QuestionnaireItem {
  const group = index % GROUPS;
  const question = index % QUESTIONS_PER_GROUP;
  switch (index % 3) {
    case 0:
      return {
        linkId: `calc${index}`,
        text: `Kopi ${index} (g${group}.q${question})`,
        type: 'integer',
        readOnly: true,
        extension: [{ url: CQF, valueString: `QuestionnaireResponse.descendants().where(linkId='g${group}.q${question}').answer.value` }],
      };
    case 1:
      return {
        linkId: `calc${index}`,
        text: `Sum ${index} (gruppe ${group})`,
        type: 'integer',
        readOnly: true,
        extension: [
          {
            url: CALCULATED,
            valueString: `QuestionnaireResponse.descendants().where(linkId.startsWith('g${group}.q')).answer.value.sum()`,
          },
        ],
      };
    default:
      return {
        linkId: `calc${index}`,
        text: `Kjede ${index} (calc${index - 1} + 1)`,
        type: 'integer',
        readOnly: true,
        extension: [
          { url: CALCULATED, valueString: `QuestionnaireResponse.descendants().where(linkId='calc${index - 1}').answer.value.sum() + 1` },
        ],
      };
  }
}

export function buildPerfQuestionnaire(calculations: number, withRows: boolean): Questionnaire {
  const item: QuestionnaireItem[] = [
    {
      linkId: 'sentinel',
      text: 'Sentinel (kopi av g0.q0)',
      type: 'integer',
      readOnly: true,
      extension: [{ url: CQF, valueString: "QuestionnaireResponse.descendants().where(linkId='g0.q0').answer.value" }],
    },
  ];
  for (let g = 0; g < GROUPS; g++) {
    item.push({
      linkId: `g${g}`,
      text: `Gruppe ${g}`,
      type: 'group',
      item: Array.from({ length: QUESTIONS_PER_GROUP }, (_, q) => ({ linkId: `g${g}.q${q}`, text: `Spørsmål ${g}.${q}`, type: 'integer' })),
    });
  }
  item.push({
    linkId: 'calc',
    text: `Beregninger (${calculations})`,
    type: 'group',
    item: Array.from({ length: calculations }, (_, i) => calculation(i)),
  });
  if (withRows) {
    item.push(
      {
        linkId: 'rows',
        text: 'Rader',
        type: 'group',
        item: [
          {
            linkId: 'row',
            text: 'Rad',
            type: 'group',
            repeats: true,
            item: [
              { linkId: 'row.a', text: 'A', type: 'string' },
              { linkId: 'row.b', text: 'B', type: 'integer' },
            ],
          },
        ],
      },
      {
        linkId: 'row-table',
        text: 'Rader (item copy gtable)',
        type: 'group',
        repeats: true,
        readOnly: true,
        extension: [
          {
            url: CQF,
            valueExpression: { name: 'row', language: 'text/fhirpath', expression: "%resource.descendants().where(linkId='row')" },
          },
          itemControl('gtable'),
        ],
        item: [
          {
            linkId: 'rt.a',
            text: 'A',
            type: 'string',
            readOnly: true,
            extension: [
              { url: CQF, valueExpression: { language: 'text/fhirpath', expression: "%row.item.where(linkId='row.a').answer.value" } },
            ],
          },
          {
            linkId: 'rt.b',
            text: 'B',
            type: 'integer',
            readOnly: true,
            extension: [
              { url: CQF, valueExpression: { language: 'text/fhirpath', expression: "%row.item.where(linkId='row.b').answer.value" } },
            ],
          },
        ],
      }
    );
  }
  return {
    resourceType: 'Questionnaire',
    id: `perf-${calculations}`,
    language: 'nb-NO',
    title: `Ytelsestest: ${calculations} beregninger`,
    status: 'draft',
    meta: { tag: [{ system: 'urn:ietf:bcp:47', code: 'nb-NO' }] },
    item,
  };
}
