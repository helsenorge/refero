import React, { Dispatch } from 'react';
import { useSelector } from 'react-redux';
import { QuestionnaireItem, QuestionnaireResponse } from 'fhir/r4';

import GTable from './tables/gtable/GTable';
import { StandardTable } from './tables/table/StandardTable';
import TableHn1 from './tables/table-hn1/TableHn1';
import TableHn2 from './tables/table-hn2/TableHn2';

import { TableCodes } from '@/constants/tableTypes';
import { GlobalState } from '@/reducers';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { findQuestionnaireItem, questionnaireResponseSelector } from '@/reducers/selectors';
import { getCodingTextTableValues } from '@/util/extension';

import GroupHeader from '../GroupHeader';
import { useExternalRenderContext } from '@/context/externalRenderContext';

type Props = QuestionnaireComponentItemProps & {
  isHelpVisible: boolean;
  setIsHelpVisible: Dispatch<React.SetStateAction<boolean>>;
};

const TableContainer = ({ linkId, isHelpVisible, setIsHelpVisible, headerTag }: Props): JSX.Element | null => {
  const item = useSelector<GlobalState, QuestionnaireItem | undefined>(state => findQuestionnaireItem(state, linkId));
  const questionnaireResponse = useSelector<GlobalState, QuestionnaireResponse | null | undefined>(questionnaireResponseSelector);

  const { resources } = useExternalRenderContext();

  if (!item || !item.item) {
    return null;
  }

  const items = item.item;
  const tableCodesCoding = item.code ?? [];
  const tableType = getCodingTextTableValues(item)[0];

  const renderTableComponent = (): React.JSX.Element | null => {
    switch (tableType) {
      case TableCodes.tableHn1:
        return <TableHn1 items={items} questionnaireResponse={questionnaireResponse} />;

      case TableCodes.tableHn2:
        return <TableHn2 items={items} tableCodesCoding={tableCodesCoding} questionnaireResponse={questionnaireResponse} />;

      case TableCodes.gtable:
        return <GTable items={items} questionnaireResponse={questionnaireResponse} tableCodesCoding={tableCodesCoding} />;

      case TableCodes.table:
        return <StandardTable items={items} questionnaireResponse={questionnaireResponse} tableCodesCoding={tableCodesCoding} />;

      default:
        return null;
    }
  };

  const tableComponent = renderTableComponent();
  if (!tableComponent) {
    return null;
  }

  return (
    <>
      <GroupHeader
        headerTag={headerTag}
        isHelpVisible={isHelpVisible}
        setIsHelpVisible={setIsHelpVisible}
        item={item}
        resources={resources}
      />
      {tableComponent}

      <br />
    </>
  );
};

export default TableContainer;
