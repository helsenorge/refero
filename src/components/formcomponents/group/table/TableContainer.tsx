import React, { Dispatch } from 'react';

import GroupHeader from '../GroupHeader';
import GTable from './tables/gtable/GTable';
import { StandardTable } from './tables/table/StandardTable';
import TableHn1 from './tables/table-hn1/TableHn1';
import TableHn2 from './tables/table-hn2/TableHn2';

import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { TableCodes } from '@/constants/tableTypes';
import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';
import { useAppSelector } from '@/reducers';
import { findQuestionnaireItem, questionnaireResponseSelector } from '@/reducers/selectors';
import { getCodingTextTableValues } from '@/util/extension';

type Props = QuestionnaireComponentItemProps & {
  isHelpVisible: boolean;
  setIsHelpVisible: Dispatch<React.SetStateAction<boolean>>;
};

const TableContainer = ({ linkId, isHelpVisible, setIsHelpVisible, headerTag }: Props): JSX.Element | null => {
  const item = useAppSelector(state => findQuestionnaireItem(state, linkId));
  const questionnaireResponse = useAppSelector(questionnaireResponseSelector);

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
