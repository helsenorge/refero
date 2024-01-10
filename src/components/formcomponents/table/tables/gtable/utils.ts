import * as uuid from 'uuid';

import { QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseItemAnswer } from '../../../../../types/fhir';

import { addAnswerToItems, filterEnabledQuestionnaireItems, findFirstDefinedProperty } from '../utils';

interface IGTable {
  id: string;
  headerRow?: IGTableHeaderItem[];
  rows: IGTableRow[];
}
interface IGTableHeaderItem {
  id: string;
  value: string;
}

interface IGTableRow {
  id: string;
  columns: IGTableColumn[];
}

interface IGTableColumn {
  id: string;
  value: string;
}

export const getGtablebodyObject = (items: QuestionnaireItem[], questionnaireResponse?: QuestionnaireResponse | null): IGTable => {
  if (!questionnaireResponse || items.length === 0) {
    return {
      id: uuid.v4(),
      rows: [],
    };
  }

  const itemsToShow = filterEnabledQuestionnaireItems(items, questionnaireResponse);
  const answerItems = addAnswerToItems(itemsToShow, questionnaireResponse);
  const rows = answerItems.reduce<IGTableRow[]>((acc, item) => {
    const row = {
      id: item.linkId,
      columns:
        item.answer?.map(answer => ({
          id: uuid.v4(),
          value: findFirstDefinedProperty<QuestionnaireResponseItemAnswer>(answer)?.toString() || '',
        })) || [],
    };
    return acc.concat(row);
  }, []);

  return {
    id: uuid.v4(),
    headerRow: answerItems.map(item => ({
      id: item.linkId,
      value: item.text || '',
    })),
    rows: rows,
  };
};
