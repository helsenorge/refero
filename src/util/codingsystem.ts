import { QuestionnaireItem, Coding } from '../types/fhir';
import CodingSystemConstants from '../constants/codingsystems';

export function getCode(system: string, item: QuestionnaireItem): Coding | undefined {
  if (!item || !item.code || item.code.length === 0) {
    return undefined;
  }
  const filteredCode: Array<Coding> = item.code.filter((e: Coding) => e.system === system);
  if (!filteredCode || filteredCode.length === 0) {
    return undefined;
  }
  return filteredCode[0];
}

export function getQuestionnaireItemCodeValue(item: QuestionnaireItem): string | undefined {
  const codingSystem = getCode(CodingSystemConstants.RenderingOptions, item);
  if (!codingSystem) {
    return undefined;
  }
  return codingSystem.code;
}
