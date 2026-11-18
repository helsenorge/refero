import type React from 'react';

import type { QuestionnaireItem } from 'fhir/r4';

import { RenderContextType } from '../constants/renderContextType';

export class RenderContext {
  public RenderContextType: RenderContextType;
  /** Grid: the column texts. Table: the linkIds of the questions shown as columns. */
  public Columns: string[];
  /** The linkId of the group that owns the grid or table. */
  public Owner: string;
  public RenderChildren?: (
    children: QuestionnaireItem[],
    renderItem: (item: QuestionnaireItem, renderContext: RenderContext) => React.JSX.Element | null
  ) => React.JSX.Element[];
  /** Every item rendered in this context is read-only, whatever the questionnaire says (for example a copied table). */
  public ReadOnly: boolean;
  /** Table: the occurrences of the owner in display order (indexes), when the rows are sorted. */
  public Order?: number[];
  /** Table: the rows have a column with delete buttons. */
  public Deletable?: boolean;
  /** Table, inside a row: the row number (from 1), so a field's name for screen readers can say which row it is in. */
  public Row?: number;

  constructor(
    renderContextType: RenderContextType = RenderContextType.None,
    owner: string = '',
    columns: string[] = [],
    renderChildren?: (
      children: QuestionnaireItem[],
      renderItem: (item: QuestionnaireItem, renderContext: RenderContext) => React.JSX.Element | null
    ) => React.JSX.Element[],
    readOnly: boolean = false
  ) {
    this.RenderContextType = renderContextType;
    this.Owner = owner;
    this.Columns = columns;
    this.RenderChildren = renderChildren;
    this.ReadOnly = readOnly;
  }
}

/**
 * The context a gtable gives its rows: the owning group's occurrences are rendered as rows, with the questions in
 * columns as cells. Like grid, the item components render themselves; the context only says where they are.
 */
export const createTableRenderContext = ({
  owner,
  columns,
  readOnly,
  order,
  deletable,
}: {
  owner: string;
  columns: string[];
  readOnly: boolean;
  order?: number[];
  deletable?: boolean;
}): RenderContext => {
  const context = new RenderContext(RenderContextType.Table, owner, columns, undefined, readOnly);
  context.Order = order;
  context.Deletable = deletable;
  return context;
};

/** The context for the cells of one row: the table's context with the row number. */
export const withTableRow = (table: RenderContext, row: number): RenderContext => {
  const context = new RenderContext(RenderContextType.Table, table.Owner, table.Columns, undefined, table.ReadOnly);
  context.Order = table.Order;
  context.Deletable = table.Deletable;
  context.Row = row;
  return context;
};

/** Whether an item is rendered in a table cell, where the column header is its title. */
export const isInTable = (renderContext?: RenderContext): boolean => renderContext?.RenderContextType === RenderContextType.Table;

/** Whether the item is the group that owns the table, so its occurrences are rendered as the table's rows. */
export const isTableRowOf = (renderContext: RenderContext | undefined, linkId: string | undefined): boolean =>
  isInTable(renderContext) && !!linkId && renderContext?.Owner === linkId && renderContext.Row === undefined;
