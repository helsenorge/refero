# sdf-item-repetition-context

`http://helsenorge.no/fhir/StructureDefinition/sdf-item-repetition-context`

**Context:** a `Questionnaire.item` with `repeats` true and `readOnly` true. Without `readOnly` the extension is ignored. **Value:**
`valueExpression` (FHIRPath). `Expression.name` is required.

The expression is evaluated against the QuestionnaireResponse and may return any collection. The item gets one repetition per element, in
the order returned, and is kept up to date as the response changes. The person filling in the form cannot add or delete repetitions.

For each repetition, the variable named by `Expression.name` is set to that repetition's element. It is visible to every expression on
descendant items (and to `calculatedExpression` on the item itself), as with SDC's `itemPopulationContext`.

- **Repeating group:** one group occurrence per element. The children get their values from their own expressions.
- **Repeating question:** one answer per element. The value comes from the question's own `calculatedExpression`, evaluated once per
  element; without one, an element that is a value or an answered question item is used as it is, and other elements are skipped. Items
  nested under the answers are not supported: refero cannot yet show them per answer. Use a repeating group for repetitions with details.

Values are set with SDC `calculatedExpression` or `sdf-calculatedExpression`. If both are on one item, SDC wins.

## Content of a repetition is calculated

Every question under the item gets its value from an expression. A question the person answers in a repetition, without an expression, is
not supported: the repetitions are rebuilt when the response changes, so such an answer is not kept. Ask the question where the data is
entered and copy the answer instead. Display items and groups are allowed.

Questions with a `calculatedExpression` should have `readOnly` true, as SDC recommends ("In most cases, 'calculated' answers will be marked
as 'readOnly'"). refero does not make them read-only on its own: `readOnly` is set per item, as in FHIR R4. Skjemabygger checks both rules.

## Example

```json
{
  "linkId": "kopi",
  "type": "group",
  "repeats": true,
  "readOnly": true,
  "extension": [
    {
      "url": "http://helsenorge.no/fhir/StructureDefinition/sdf-item-repetition-context",
      "valueExpression": { "name": "row", "language": "text/fhirpath", "expression": "%resource.repeat(item).where(linkId='medisin')" }
    }
  ],
  "item": [
    {
      "linkId": "kopi.navn",
      "type": "string",
      "readOnly": true,
      "extension": [
        {
          "url": "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression",
          "valueExpression": { "language": "text/fhirpath", "expression": "%row.item.where(linkId='medisin.navn').answer.value" }
        }
      ]
    }
  ]
}
```

With itemControl `gtable` on the group, the occurrences are shown as table rows.

## Why not an SDC extension

`cqf-expression` gives the value of the element it sits on, which a group does not have. SDC's `itemPopulationContext` and
`candidateExpression` bind one value per repetition, but only when the form is populated or the user picks a candidate, not live. A named
expression without such a rule is bound to its whole result, so another tool would give every repetition all rows.
