# Item copying and gtable

## Item copying

A group (or a repeating question) with a copy expression (`cqf-expression`) that selects response items gets one
occurrence per selected item. This is the row source:

```json
{ "url": "http://hl7.org/fhir/StructureDefinition/cqf-expression",
  "valueExpression": { "name": "row", "language": "text/fhirpath",
                       "expression": "%resource.descendants().where(linkId='medisin')" } }
```

The questions in the group read their value from their own row with `%row` (or the name given in the expression):
`%row.descendants().where(linkId='medisin.dose').answer.value`. A missing answer gives an empty question in that row, so
answers never move to another row. Rows can be filtered in the row source with `where(...)`.

- `FhirPathExtensions` builds the occurrences (`collectItemCopies`); `runCalculators` returns them as `itemCopies` next to
  the `answerPad`, and `runFhirPathUpdater` dispatches `replaceItemCopiesAction` when they change. The reducer replaces the
  occurrences under each parent (`applyItemCopies`). A new response gets them from the start (`withItemCopiesApplied`).
- Copied occurrences are read-only: no buttons to add or delete them (`isItemCopyTarget`).
- A copied question that `enableWhen` turns off gets no answer (`withoutDisabledAnswers`). The condition is looked up in
  the same occurrence first, then in the whole response.
