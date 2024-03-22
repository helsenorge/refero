import React from 'react';

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

import { Resources } from '../../../types/resources';

import LanguageLocales from '@helsenorge/core-utils/constants/languages';

import GTable from './tables/gtable/GTable';
import { StandardTable } from './tables/table/StandardTable';
import TableHn1 from './tables/table-hn1/TableHn1';
import TableHn2 from './tables/table-hn2/TableHn2';
import { TABLE_CODES_VALUES, TableCodes } from '../../../constants/tableTypes';
import { GlobalState } from '../../../store/reducers';
import { getFormData, getFormDefinition } from '../../../store/selectors/index';
import { getCodingTextTableValues } from '../../../util/extension';
import { Path } from '../../../util/refero-core';
import { RenderContext } from '../../../util/renderContext';

export interface TableContainerProps {
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
  renderContext: RenderContext;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}
export type TableContainerAllProps = TableContainerEnhancedProps & TableContainerProps;

interface TableContainerEnhancedProps {
  headline: string;
  tableCodesCoding: Coding[];
  items: QuestionnaireItem[];
  tableType: TABLE_CODES_VALUES;
  questionnaireResponse?: QuestionnaireResponse | null;
  language: LanguageLocales;
  resource: Resource[] | undefined;
}

const TableContainer = ({
  tableCodesCoding,
  items,
  headline,
  tableType,
  questionnaireResponse,
  resource,
}: TableContainerProps & TableContainerEnhancedProps): JSX.Element => {
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

const mapStateToProps = (state: GlobalState, props: TableContainerProps): TableContainerEnhancedProps => {
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
