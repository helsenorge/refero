import {
  Coding,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
  Resource,
} from 'fhir/r4';
import { connect } from 'react-redux';

import LanguageLocales from '@helsenorge/core-utils/constants/languages';

import GTable from './tables/gtable/GTable';
import { StandardTable } from './tables/table/StandardTable';
import TableHn1 from './tables/table-hn1/TableHn1';
import TableHn2 from './tables/table-hn2/TableHn2';
import { TABLE_CODES_VALUES, TableCodes } from '@/constants/tableTypes';
import { GlobalState } from '@/reducers';
import { getFormData, getFormDefinition } from '@/reducers/form';
import { getCodingTextTableValues } from '@/util/extension';
import { Path } from '@/util/refero-core';
import { Resources } from '@/util/resources';

export interface Props {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire | null;
  answer?: QuestionnaireResponseItemAnswer | null;
  responseItem: QuestionnaireResponseItem;
  path: Array<Path>;
  pdf?: boolean;
  includeSkipLink?: boolean;
  className?: string;
  resources?: Resources;
  headerTag?: number;
  attachmentErrorMessage?: string;
  repeatButton?: JSX.Element;
  id?: string;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

export interface StateProps {
  headline: string;
  tableCodesCoding: Coding[];
  items: QuestionnaireItem[];
  tableType: TABLE_CODES_VALUES;
  questionnaireResponse?: QuestionnaireResponse | null;
  language: LanguageLocales;
  resource: Resource[] | undefined;
}
export interface CombinedProps extends Props, StateProps {}
const TableContainer = ({ tableCodesCoding, items, headline, tableType, questionnaireResponse, resource }: CombinedProps): JSX.Element => {
  {
    switch (tableType) {
      case TableCodes.tableHn1:
        return (
          <>
            <h3>{headline}</h3>
            <TableHn1 items={items} questionnaireResponse={questionnaireResponse} />
            <br />
          </>
        );
      case TableCodes.tableHn2:
        return (
          <>
            <h3>{headline}</h3>
            <TableHn2 items={items} tableCodesCoding={tableCodesCoding} questionnaireResponse={questionnaireResponse} />
            <br />
          </>
        );
      case TableCodes.gtable:
        return (
          <>
            <h3>{headline}</h3>
            <GTable items={items} questionnaireResponse={questionnaireResponse} tableCodesCoding={tableCodesCoding} />
            <br />
          </>
        );
      case TableCodes.table:
        return (
          <>
            <h3>{headline}</h3>
            <StandardTable
              items={items}
              questionnaireResponse={questionnaireResponse}
              resource={resource}
              tableCodesCoding={tableCodesCoding}
            />
            <br />
          </>
        );
      default:
        return <></>;
    }
  }
};

const mapStateToProps = (state: GlobalState, props: Props): StateProps => {
  const group = props.item;
  const tableType = getCodingTextTableValues(group)[0];
  const resource = getFormDefinition(state)?.Content?.contained;
  return {
    headline: group.text ?? '',
    tableCodesCoding: group.code ?? [],
    items: group.item ?? [],
    tableType,
    questionnaireResponse: getFormData(state)?.Content,
    language: (state.refero.form.Language as LanguageLocales) || LanguageLocales.NORWEGIAN,
    resource,
  };
};
export default connect(mapStateToProps)(TableContainer);
