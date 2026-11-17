# Item copying and gtable

## Item copying

A group (or a repeating question) with a copy expression (`cqf-expression`) that selects response items gets one occurrence per selected
item. This is the row source:

```json
{
  "url": "http://hl7.org/fhir/StructureDefinition/cqf-expression",
  "valueExpression": { "name": "row", "language": "text/fhirpath", "expression": "%resource.descendants().where(linkId='medisin')" }
}
```

The questions in the group read their value from their own row with `%row` (or the name given in the expression):
`%row.descendants().where(linkId='medisin.dose').answer.value`. A missing answer gives an empty question in that row, so answers never move
to another row. Rows can be filtered in the row source with `where(...)`.

- `FhirPathExtensions` builds the occurrences (`collectItemCopies`); `runCalculators` returns them as `itemCopies` next to the `answerPad`,
  and `runFhirPathUpdater` dispatches `replaceItemCopiesAction` when they change. The reducer replaces the occurrences under each parent
  (`applyItemCopies`). A new response gets them from the start (`withItemCopiesApplied`).
- Copied occurrences are read-only: no buttons to add or delete them (`isItemCopyTarget`).
- A copied question that `enableWhen` turns off gets no answer (`withoutDisabledAnswers`). The condition is looked up in the same occurrence
  first, then in the whole response.

## gtable

`itemControl` `gtable` on a repeating group shows its occurrences as a table: one row per occurrence, one column per question. It does not
matter how the occurrences are filled in: copied rows are read-only and can be sorted, rows the person fills in are editable, with "add row"
and a delete button per row.

It is rendered like grid. `group/GTableView.tsx` (the first occurrence) draws the heading, the table and the column headers, and hands the
rows to the normal pipeline with a table render context (`RenderContextType.Table`, owner = the group). Each occurrence of the owner is
rendered by `group/GTableRowView.tsx` as a row, with each question's own component in its cell. The table only selects what it needs itself
(visible columns, number of rows, the sort column's values).

The render context tells a component it is in a table:

- the item leaves out its title, since the column header is the title (`TextView`, `ReferoLabel`); a field keeps its label for screen
  readers, with the row number ("Navn, rad 2");
- the item is read-only when the table is (`isReadOnly(item, renderContext)`, also used for validation).

Show and hide: the components decide `hidden` and `enableWhen` per cell, as everywhere else, so a question turned off in a row leaves its
cell empty. A question with `hidden` is not a column, and a question turned off by a condition on a question outside the group is left out
as a column. A table without rows is not shown.

Sorting: no default sorting. `TableOrderingColum` and `TableOrderingFunctions` set a default; the person can sort a read-only table by
clicking a header. Values are compared raw (dates, times and numbers as such).

An old gtable (no row source on the group, columns that read flat lists from the whole response) is still rendered by
`group/table/tables/gtable` until the forms are migrated.
