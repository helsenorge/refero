import React from 'react';

import { QuestionnaireItem, QuestionnaireResponse } from '../../../../../types/fhir';

import { Table as HnTable, TableBody, TableCell, TableRow } from '@helsenorge/designsystem-react/components/Table';

import { TABLE_HN1_TABLE_TYPES } from './interface';
import { getTableHN1bodyObject } from './utils';

interface Props {
  items: QuestionnaireItem[];
  questionnaireResponse?: QuestionnaireResponse | null;
}
const TableHn1 = ({ items, questionnaireResponse }: Props): JSX.Element => {
  const answerValues = getTableHN1bodyObject(items, questionnaireResponse);
  return (
    <HnTable className="page_refero__table_hn1">
      <TableBody>
        {answerValues.map(item => (
          <TableRow key={item.id}>
            {item.columns.map(({ value, id, type }) => (
              <React.Fragment key={id}>
                <TableCell dataLabel="Navn">
                  <span className={type === TABLE_HN1_TABLE_TYPES.HEADER ? 'page_refero__table_hn1__heading' : ''}>{value ?? ''}</span>
                </TableCell>
              </React.Fragment>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </HnTable>
  );
};

export default TableHn1;
