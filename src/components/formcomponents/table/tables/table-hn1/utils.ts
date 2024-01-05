import { QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseItem } from '../../../../../types/fhir';

import { ITableH1, ITableH1Column, ITableH1Row, TABLE_HN1_TABLE_TYPES } from './interface';
import ItemType from '../../../../../constants/itemType';
import { addAnswerToItems, filterEnabledQuestionnaireItems, transformAnswersToListOfStrings } from '../utils';

export const getTableHN1bodyObject = (items: QuestionnaireItem[], questionnaireResponse?: QuestionnaireResponse | null): ITableH1 => {
  if (!questionnaireResponse || items.length === 0) {
    return [];
  }
  const itemsToShow = filterEnabledQuestionnaireItems(items, questionnaireResponse);

  const answerItems = addAnswerToItems(itemsToShow, questionnaireResponse);

  const processItems = (items: QuestionnaireResponseItem[]): ITableH1Row[] => {
    return items.reduce((acc: ITableH1Row[], item) => {
      const row = transformItemToHN1Row(item);
      const newAcc = acc.concat(row);

      const nestedRows = item.item ? processItems(item.item) : [];
      return newAcc.concat(nestedRows);
    }, []);
  };

  return processItems(answerItems);
};

const createColumnsFromAnswers = (item: QuestionnaireResponseItem): ITableH1Column[] => {
  const combinedAnswer = transformAnswersToListOfStrings((item as QuestionnaireItem).type, item.answer || []).join(', ');

  const columns: ITableH1Column[] = [
    {
      id: `${item.linkId}-question`,
      type: (item as QuestionnaireItem).type === ItemType.GROUP ? TABLE_HN1_TABLE_TYPES.HEADER : TABLE_HN1_TABLE_TYPES.VALUE,
      value: item.text || '',
    },
    {
      value: combinedAnswer,
      type: TABLE_HN1_TABLE_TYPES.VALUE,
      id: `${item.linkId}-answer`,
    },
  ];

  return columns;
};
const transformItemToHN1Row = (item: QuestionnaireResponseItem): ITableH1Row => {
  const columns = createColumnsFromAnswers(item);

  return {
    id: item.linkId,
    columns: columns,
  };
};
