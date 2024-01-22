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
    <HnTable className="page_refero__table__gtable">
      <TableHead category={HeaderCategory.normal} className="page_refero__table__gtable__header">
        <TableRow className="page_refero__table__gtable__header__row">
          {gTable?.headerRow?.map(column => (
            <TableHeadCell key={column.id} className="page_refero__table__gtable__header__row__cell">
              {column.value}
            </TableHeadCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody className="page_refero__table__gtable__body">
        {gTable.rows.map(item => {
          return (
            <TableRow key={item.id} className="page_refero__table__gtable__body__row">
              {item.columns.map(column => (
                <TableCell key={column.id} dataLabel={column.value} className="page_refero__table__gtable__body__row__cell">
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
