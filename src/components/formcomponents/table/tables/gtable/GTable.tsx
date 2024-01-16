import React from 'react';

import { QuestionnaireItem, QuestionnaireResponse } from '../../../../../types/fhir';

import {
  TableBody,
  Table as HnTable,
  TableRow,
  TableCell,
  TableHead,
  HeaderCategory,
  TableHeadCell,
} from '@helsenorge/designsystem-react/components/Table';

import { getGtablebodyObject } from './utils';

interface Props {
  items: QuestionnaireItem[];
  questionnaireResponse?: QuestionnaireResponse | null;
}

const GTable = ({ items, questionnaireResponse }: Props): JSX.Element => {
  const gTable = getGtablebodyObject(items, questionnaireResponse);
  return gTable.rows.length > 0 ? (
    <HnTable className="page_refero__table_gtable">
      <TableHead category={HeaderCategory.normal}>
        <TableRow>
          {gTable?.headerRow?.map(column => (
            <TableHeadCell key={column.id}>{column.value}</TableHeadCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {gTable.rows.map(item => {
          return (
            <TableRow key={item.id}>
              {item.columns.map(column => (
                <TableCell key={column.id} dataLabel={column.value}>
                  {column.value}
                </TableCell>
              ))}
            </TableRow>
          );
        })}
      </TableBody>
    </HnTable>
  ) : (
    <></>
  );
};

export default GTable;
