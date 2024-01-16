import React from 'react';

import { QuestionnaireItem, QuestionnaireResponse, Resource } from '../../../../../types/fhir';

import {
  HeaderCategory,
  Table as HnTable,
  ModeType,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from '@helsenorge/designsystem-react/components/Table';

import { getStandardTableObject } from './utils';

interface Props {
  items: QuestionnaireItem[];
  questionnaireResponse?: QuestionnaireResponse | null;
  resource?: Resource[];
}

export const StandardTable = ({ items, questionnaireResponse, resource }: Props): JSX.Element => {
  const table = getStandardTableObject(items, questionnaireResponse, resource);
  return table.rows.length > 0 ? (
    <HnTable mode={ModeType.normal} className="page_refero__standard-table">
      <TableHead category={HeaderCategory.normal} className="page_refero__standard-table__header">
        <TableRow className="page_refero__standard-table__header__row">
          {table.headerRow.map(column => (
            <TableHeadCell className="page_refero__standard-table__header__row__cell" key={column.id}>
              <span className="page_refero__standard-table__header__row__cell">{column.value}</span>
            </TableHeadCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody className="page_refero__standard-table__body">
        {table.rows.map(item => (
          <TableRow key={item.id} className="page_refero__standard-table__body__row">
            {item.columns.map(({ value, id }) => (
              <React.Fragment key={id}>
                <TableCell className="page_refero__standard-table__body__row__cell" dataLabel="Navn">
                  <span className="page_refero__standard-table__body__row__cell__value">{value}</span>
                </TableCell>
              </React.Fragment>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </HnTable>
  ) : (
    <></>
  );
};
