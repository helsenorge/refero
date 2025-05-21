import { FhirPathExtensions } from '../FhirPathExtensions';
import { q, q1, qr1, qr2, qr3, qr4, qr5 } from './__data__/fhirPathExtensions/index';

describe('fhirPatExtensions', () => {
  describe('calculateFhirScore', () => {
    const fhirPathUpdater = new FhirPathExtensions(q);
    it('Should calculate fhir scores with all nested fields filled out', () => {
      const fhirScores = fhirPathUpdater.calculateFhirScore(qr3);
      expect(fhirScores).toEqual({
        'c2c3575c-92e1-4795-8369-ba8ecec81341': [
          {
            valueString: 'aaa',
            item: [{ linkId: '319431c9-9ded-458d-cd5f-c6c81d900861', text: 'text 2', answer: [{ valueString: 'bbb' }] }],
          },
        ],
        '3c5bcf11-2c67-46e5-9e1a-c63b354eb839': [
          {
            valueCoding: { code: '1', display: 'Ja', system: 'urn:oid:2.16.578.1.12.4.1.1101' },
            item: [
              {
                linkId: 'c2c3575c-92e1-4795-8369-ba8ecec81341',
                text: 'Beskriv',
                answer: [
                  {
                    valueString: 'aaa',
                    item: [{ linkId: '319431c9-9ded-458d-cd5f-c6c81d900861', text: 'text 2', answer: [{ valueString: 'bbb' }] }],
                  },
                ],
              },
            ],
          },
        ],
      });
    });
    it('Should calculate fhir scores with only last nested field is filled out', () => {
      const fhirScores = fhirPathUpdater.calculateFhirScore(qr4);
      expect(fhirScores).toEqual({
        'c2c3575c-92e1-4795-8369-ba8ecec81341': [
          { item: [{ linkId: '319431c9-9ded-458d-cd5f-c6c81d900861', text: 'text 2', answer: [{ valueString: 'bbb' }] }] },
        ],
        '3c5bcf11-2c67-46e5-9e1a-c63b354eb839': [
          {
            valueCoding: { code: '1', display: 'Ja', system: 'urn:oid:2.16.578.1.12.4.1.1101' },
            item: [
              {
                linkId: 'c2c3575c-92e1-4795-8369-ba8ecec81341',
                text: 'Beskriv',
                answer: [{ item: [{ linkId: '319431c9-9ded-458d-cd5f-c6c81d900861', text: 'text 2', answer: [{ valueString: 'bbb' }] }] }],
              },
            ],
          },
        ],
      });
    });
    it('repeated item: should calculate fhir scores with all nested fields filled out', () => {
      const fhirScores = fhirPathUpdater.calculateFhirScore(qr1);
      expect(fhirScores).toEqual({
        'c2c3575c-92e1-4795-8369-ba8ecec81341': [
          {
            valueString: 'aaa',
            item: [
              { linkId: '319431c9-9ded-458d-cd5f-c6c81d900861', text: 'text 2', answer: [{ valueString: 'bbb' }, { valueString: 'ddd' }] },
            ],
          },
          { valueString: 'ccc' },
        ],
        '3c5bcf11-2c67-46e5-9e1a-c63b354eb839': [
          {
            valueCoding: { code: '1', display: 'Ja', system: 'urn:oid:2.16.578.1.12.4.1.1101' },
            item: [
              {
                linkId: 'c2c3575c-92e1-4795-8369-ba8ecec81341',
                text: 'Beskriv',
                answer: [
                  {
                    valueString: 'aaa',
                    item: [
                      {
                        linkId: '319431c9-9ded-458d-cd5f-c6c81d900861',
                        text: 'text 2',
                        answer: [{ valueString: 'bbb' }, { valueString: 'ddd' }],
                      },
                    ],
                  },
                  { valueString: 'ccc' },
                ],
              },
            ],
          },
          { valueCoding: { code: '1', display: 'Ja', system: 'urn:oid:2.16.578.1.12.4.1.1101' } },
        ],
      });
    });
    it('repeated item: should calculate fhir scores when nested parent item is not answerd', () => {
      const fhirScores = fhirPathUpdater.calculateFhirScore(qr2);
      expect(fhirScores).toEqual({
        'c2c3575c-92e1-4795-8369-ba8ecec81341': [
          {
            valueString: 'ccc',
            item: [{ linkId: '319431c9-9ded-458d-cd5f-c6c81d900861', text: 'text 2', answer: [{ valueString: 'bbb' }] }],
          },
        ],
        '3c5bcf11-2c67-46e5-9e1a-c63b354eb839': [
          {
            valueCoding: { code: '1', display: 'Ja', system: 'urn:oid:2.16.578.1.12.4.1.1101' },
            item: [
              {
                linkId: 'c2c3575c-92e1-4795-8369-ba8ecec81341',
                text: 'Beskriv',
                answer: [
                  {
                    valueString: 'ccc',
                    item: [{ linkId: '319431c9-9ded-458d-cd5f-c6c81d900861', text: 'text 2', answer: [{ valueString: 'bbb' }] }],
                  },
                ],
              },
            ],
          },
          { valueCoding: { code: '1', display: 'Ja', system: 'urn:oid:2.16.578.1.12.4.1.1101' } },
        ],
      });
    });
  });
  describe('hasFhirPaths', () => {
    it('Should return true if questionnaire has fhir paths', () => {
      const fhirPathUpdater = new FhirPathExtensions(q);
      expect(fhirPathUpdater.hasFhirPaths()).toBe(true);
    });
    it('Should return false if questionnaire does not have fhir paths', () => {
      const fhirPathUpdater = new FhirPathExtensions(q1);
      expect(fhirPathUpdater.hasFhirPaths()).toBe(false);
    });
  });
  describe('evaluateAllExpressions', () => {
    it('Should evaluate all expressions and update response items with calculated values', () => {
      const fhirPathUpdater = new FhirPathExtensions(q);
      const evaluatedResponse = fhirPathUpdater.evaluateAllExpressions(qr5);

      expect(evaluatedResponse).toEqual(qr1);
    });
  });
});
