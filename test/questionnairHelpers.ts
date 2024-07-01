import { Questionnaire, QuestionnaireItem } from 'fhir/r4';

export const addPropertyToQuestionnaireItem = (
  questionnaire: Questionnaire,
  property: keyof QuestionnaireItem,
  value: QuestionnaireItem[keyof QuestionnaireItem],
  linkId?: QuestionnaireItem['linkId']
): Questionnaire => {
  return {
    ...questionnaire,
    item: questionnaire.item?.map((item: QuestionnaireItem) => {
      if (linkId && item.linkId === linkId) {
        return { ...item, [property]: value };
      } else if (linkId === undefined) {
        return { ...item, [property]: value };
      }
      return item;
    }),
  };
};

export const addManyPropertiesToQuestionnaireItem = (
  questionnaire: Questionnaire,
  properties: { property: keyof QuestionnaireItem; value: QuestionnaireItem[keyof QuestionnaireItem] }[],
  linkId?: QuestionnaireItem['linkId']
): Questionnaire => {
  return properties.reduce((acc, { property, value }) => addPropertyToQuestionnaireItem(acc, property, value, linkId), questionnaire);
};
