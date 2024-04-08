import { Questionnaire, QuestionnaireItem } from 'fhir/r4';

import { createZodSchemaFromQuestionnaireItems, inspectZodSchema } from '../mainValidationFunctions'; // Adjust the import path as needed
import testSchema from '../../preview/skjema/simple_schema.json';
describe('Schema Generation', () => {
  test('generates correct schema for simple items', () => {
    // const items: QuestionnaireItem[] = [{ linkId: '1', type: ItemType.STRING }];
    const test: Questionnaire = testSchema;
    const schema = createZodSchemaFromQuestionnaireItems(test.item ?? []);
    console.log(JSON.stringify(inspectZodSchema(schema), null, 2));
    expect(schema.safeParse({ '08ecd17b-3a23-4ca5-8dfc-5f12c010cd2f': 'test@test.no' }).success).toBe(true);
    expect(schema.safeParse({ '1': 123 }).success).toBe(false);
  });
});
