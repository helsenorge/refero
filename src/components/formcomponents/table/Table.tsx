import React from 'react';

import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
  Coding,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
} from '../../../types/fhir';

import TableHn1 from './tables/TableHn1';
import TableHn2 from './tables/TableHn2';
import { NewValueAction } from '../../../actions/newValue';
import { TableCodes } from '../../../constants/tableTypes';
import { GlobalState } from '../../../reducers';
import { getFormData } from '../../../reducers/form';
import { getCodingTextTableValues } from '../../../util/extension';
import { Path } from '../../../util/refero-core';
import { RenderContext } from '../../../util/renderContext';
import { Resources } from '../../../util/resources';

export interface Props {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  answer: QuestionnaireResponseItemAnswer;
  responseItem: QuestionnaireResponseItem;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  path: Array<Path>;
  pdf?: boolean;
  includeSkipLink?: boolean;
  className?: string;
  resources?: Resources;
  headerTag?: number;
  attachmentErrorMessage?: string;
  repeatButton: JSX.Element;
  id?: string;
  renderContext: RenderContext;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  isHelpOpen?: boolean;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

interface EnhancedProps {
  headline: string;
  tableCodes: Coding[];
  items: QuestionnaireItem[];
  tableType: TableCodes;
  questionnaireResponse?: QuestionnaireResponse | null;
}

const Table = ({ tableCodes, items, headline, tableType, questionnaireResponse }: Props & EnhancedProps): JSX.Element => {
  {
    switch (tableType) {
      case 'table-hn1':
        return (
          <>
            <h3>{headline}</h3>
            <TableHn1 items={items} tableCodes={tableCodes} questionnaireResponse={questionnaireResponse} />
          </>
        );
      case 'table-HN2':
        return (
          <>
            <h3>{headline}</h3>
            <TableHn2 items={items} tableCodes={tableCodes} questionnaireResponse={questionnaireResponse} />
          </>
        );
      default:
        return <>{'Nothing found'}</>;
    }
  }
};

const mapStateToProps = (state: GlobalState, props: Props): EnhancedProps => {
  const group = props.item;
  //TODO: Fix undefine and null checks
  const tableType = getCodingTextTableValues(group)[0];

  return {
    headline: group.text ?? '',
    tableCodes: group.code ?? [],
    items: group.item ?? [],
    tableType,
    questionnaireResponse: getFormData(state)?.Content,
  };
};
export default connect(mapStateToProps)(Table);
