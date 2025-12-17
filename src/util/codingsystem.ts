import type { QuestionnaireItem, Coding } from 'fhir/r4';

export function getCodes(item?: QuestionnaireItem, system?: string): Coding[] | undefined {
  if (!item || !item.code || item.code.length === 0) {
    return undefined;
  }
  const filteredCode: Array<Coding> = item.code.filter((e: Coding) => e.system === system);
  if (!filteredCode || filteredCode.length === 0) {
    return undefined;
  }
  return filteredCode;
}

export const getCode = (item?: QuestionnaireItem, system?: string): Coding | undefined => getCodes(item, system)?.[0];

export function getQuestionnaireItemCodeValue(item?: QuestionnaireItem, codesytem?: string): string | undefined {
  const codingSystem = getCode(item, codesytem);
  if (!codingSystem) {
    return undefined;
  }
  return codingSystem.code;
}
