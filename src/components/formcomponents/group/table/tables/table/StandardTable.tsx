import React, { useEffect, useState } from 'react';

import { Coding, QuestionnaireItem, QuestionnaireResponse } from 'fhir/r4';

import {
  Table as HnTable,
  ModeType,
  SortDirection,
  TableBody,
  TableCell,
  TableHeadCell,
  TableRow,
} from '@helsenorge/designsystem-react/components/Table';

import { StandardTableHeader } from './StandardTableHeader';
import { getDisplayToSortBy, getStandardTableObject } from './utils';
import { containedResourceSelector } from '../../tableSelector';
import { transformCodingToSortDirection } from '../utils';
import { IStandardTable } from './interface';

import { useAppSelector } from '@/reducers';

interface Props {
  items: QuestionnaireItem[];
  tableCodesCoding: Coding[];
  questionnaireResponse?: QuestionnaireResponse | null;
}

export const StandardTable = ({ items, questionnaireResponse, tableCodesCoding }: Props): React.JSX.Element | null => {
  const displayToSortBy = getDisplayToSortBy(tableCodesCoding);
  const resource = useAppSelector(containedResourceSelector);
  const [tableData, setTableData] = useState<IStandardTable>({
    rows: [],
    headerRow: [],
    id: '',
  });
  const [sortDir, setSortDir] = useState<SortDirection | undefined>(transformCodingToSortDirection(tableCodesCoding));

  useEffect(() => {
    const fetchTableData = async (): Promise<void> => {
      const table = await getStandardTableObject(items, questionnaireResponse, resource, sortDir, displayToSortBy);
      setTableData(table);
    };
    fetchTableData();
  }, [items, questionnaireResponse, resource, sortDir, displayToSortBy]);

  useEffect(() => {
    setSortDir(transformCodingToSortDirection(tableCodesCoding));
  }, [tableCodesCoding]);

  return tableData.rows.length > 0 ? (
    <HnTable mode={ModeType.normal} className="page_refero__standard-table" testId="standardTable">
      <StandardTableHeader headerRow={tableData.headerRow} setSortDir={setSortDir} displayToSortBy={displayToSortBy} sortDir={sortDir} />
      <TableBody className="page_refero__standard-table__body">
        {tableData.rows.map(item => (
          <TableRow key={item.id} className="page_refero__standard-table__body__row">
            {item.columns.map(({ value, id }, colIndex) => {
              if (colIndex === 0) {
                return (
                  <TableHeadCell key={id}>
                    <span className="page_refero__standard-table__body__row__cell__value">{value}</span>
                  </TableHeadCell>
                );
              }
              if (colIndex === item.columns.length - 1) {
                return (
                  <TableCell key={id} className="page_refero__standard-table__body__row__cell" dataLabel={item.columns[0].value}>
                    <span className="page_refero__standard-table__body__row__cell__value">{value}</span>
                  </TableCell>
                );
              }
              return (
                <TableCell
                  key={id}
                  className="page_refero__standard-table__body__row__cell"
                  dataLabel={tableData.headerRow[colIndex]?.value ?? ''}
                >
                  <span className="page_refero__standard-table__body__row__cell__value">{value}</span>
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </HnTable>
  ) : null;
};
