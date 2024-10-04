import { QuestionnaireItem, QuestionnaireResponse } from 'fhir/r4';
import { useSelector } from 'react-redux';

import GTable from './tables/gtable/GTable';
import { StandardTable } from './tables/table/StandardTable';
import TableHn1 from './tables/table-hn1/TableHn1';
import TableHn2 from './tables/table-hn2/TableHn2';
import { TableCodes } from '@/constants/tableTypes';
import { GlobalState, useAppDispatch } from '@/reducers';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';

import { findQuestionnaireItem, questionnaireResponseSelector } from '@/reducers/selectors';
import { getCodingTextTableValues } from '@/util/extension';

export type Props = QuestionnaireComponentItemProps & {
  className?: string;
  attachmentErrorMessage?: string;
};

export type CombinedProps = Props;
const TableContainer = ({ linkId }: CombinedProps): JSX.Element | null => {
  const item = useSelector<GlobalState, QuestionnaireItem | undefined>(state => findQuestionnaireItem(state, linkId));
  const questionnaireResponse = useSelector<GlobalState, QuestionnaireResponse | null | undefined>(questionnaireResponseSelector);

  if (!item || !item.item) {
    return null;
  }
  const headline = item.text;
  const items = item.item;
  const tableCodesCoding = item.code ?? [];
  const tableType = getCodingTextTableValues(item)[0];
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
            <StandardTable items={items} questionnaireResponse={questionnaireResponse} tableCodesCoding={tableCodesCoding} />
            <br />
          </>
        );
      default:
        return <></>;
    }
  }
};

export default TableContainer;
