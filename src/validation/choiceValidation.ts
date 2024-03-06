import { FhirResource, Questionnaire, QuestionnaireItem, ValueSet } from 'fhir/r4';
import { z } from 'zod';

function isValueSet(resource?: FhirResource): resource is ValueSet {
  return resource?.resourceType === 'ValueSet';
}

function extractValueSet(questionnaire: Questionnaire, referenceId: string): ValueSet | undefined {
  const resource = questionnaire.contained?.find(resource => resource.id === referenceId);
  return isValueSet(resource) ? resource : undefined;
}

export const createChoiceSchema = (item: QuestionnaireItem, questionnaire: Questionnaire): z.ZodTypeAny | undefined => {
  // Handling inline answerOption for custom ValueSet directly defined within the item
  if (item.answerOption) {
    const defaultCode = 'DEFAULT_CODE';
    const codes = item.answerOption.map(option => option.valueCoding?.code).filter((code): code is string => code !== undefined);
    return z.enum([defaultCode, ...codes]).optional();
  }

  // Handling referenced ValueSet contained within the same Questionnaire
  if (item.answerValueSet && item.answerValueSet.startsWith('#')) {
    const valueSet = extractValueSet(questionnaire, item.answerValueSet.substring(1));
    if (!valueSet) return undefined;
    const defaultCode = 'DEFAULT_CODE';
    const codes = valueSet.compose?.include
      .flatMap(include => include.concept?.map(concept => concept.code))
      .filter((code): code is string => code !== undefined);

    if (!codes || codes.length === 0) return undefined;

    return z.enum([defaultCode, ...codes]).optional();
  }

  return undefined; // Or handle as needed
};
