# PDR-REFERO-001: Repetitions from an expression (sdf-item-repetition-context)

## Status

**Foreslått (2026-11-25).** No ADR: the change is to the form format refero reads, not to storage, hosting or integrations.

## Who asked for it

Reuben Ringdal, 2026-11-25, after checking the item copy on `rubenr/gtable-view` against FHIR R4 and SDC. It is for migrating the existing
gtable forms to the new table, where rows cannot get mixed up.

## Problem

The unreleased item copy (26.1.0) and the new gtable (26.2.0) use `cqf-expression` on a group as the row source, and `cqf-expression` on the
questions for the values. Neither follows the spec:

- R4 defines `cqf-expression` as the value of the element it sits on. On a group that has no meaning, and the SDC profiles only use it on
  single values (`minValue`, `minOccurs`, `item.text` and so on). SDC's mechanism for calculated answers is `calculatedExpression`.
- SDC binds a named expression to its whole result for descendant items. Only `itemPopulationContext` and `candidateExpression` bind one
  value per group repetition, and both run once at population, not live. Another SDC tool would bind `%row` to every row at once.

Nothing is released, so the format can still change without migrating published forms.

## Users

Form authors who build tables and lists from answers given earlier in the form, and the people filling in those forms.

## Goals

The acceptance criteria are in [PDR-REFERO-001.aksept.md](PDR-REFERO-001.aksept.md).

What weighs most: one value per repetition, so answers never move to another row (K3, K8), and the old gtables keep working while the forms
are migrated (K13).

## Non-goals

- Skjemabygger support for the new extension and SDC `calculatedExpression` (separate task).
- Publishing the extension in the sdf profile.
- Migrating the gtable forms, and removing the old gtable code.
- Changing `cqf-expression` value copy on questions outside repetitions.

## Solution, from the user's side

A repeating group or question gets `sdf-item-repetition-context`. Its expression selects what the repetitions are made from, and
`Expression.name` names the variable each repetition sees. The children get their values with `calculatedExpression` (SDC or sdf), and every
expression under the item can read the variable. The item must be `readOnly`; the person cannot add or delete repetitions. See
[sdf-item-repetition-context](../sdf-item-repetition-context.md).

Decisions (Reuben Ringdal, 2026-11-25):

- Name `sdf-item-repetition-context`, after SDC's `itemPopulationContext` and `itemExtractionContext`.
- The expression may return any collection.
- Allowed on repeating groups and repeating questions. On a question, its own `calculatedExpression` gives each answer's value, evaluated
  once per element. Items nested under the answers of such a question are not supported, since refero renders every answer's nested items as
  the first answer's; a repeating group is used for details. Fixing refero's paths for nested items per answer is a later task (Reuben
  Ringdal, 2026-11-25).
- The variable is visible to all expressions on descendant items.
- Without `readOnly` the extension is ignored.
- refero reads SDC `calculatedExpression` everywhere. If an item has both SDC and sdf `calculatedExpression`, SDC wins.
- The unreleased `cqf-expression` row source on groups is dropped.
- A gtable group goes to the new table when it has the extension, or repeats without copy expressions on its children; otherwise to the old
  table.
- The content of a repetition is calculated: every question under the item gets its value from an expression. Answers the person gives
  inside a repetition are not supported; such a question is asked where the data is entered. Questions with a `calculatedExpression` should
  be `readOnly` (SDC); refero does not force it, since R4 sets `readOnly` per item. Skjemabygger checks both. Keeping per-row answers tied
  to the source element is a possible later task (Reuben Ringdal, 2026-11-25).

## Concept budget

| Concept                                                                               | Why nothing existing fits                                                                             |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Extension `http://helsenorge.no/fhir/StructureDefinition/sdf-item-repetition-context` | No R4 or SDC extension creates repetitions live from the response and binds one value per repetition. |
| Support for SDC `sdc-questionnaire-calculatedExpression`                              | Not new to FHIR; new to refero, which only reads `sdf-calculatedExpression`.                          |

## Success measures

The old gtable forms can be migrated one by one, and a migrated form gives the same rows as the old one, with no row mix-ups.

## Rollout

No switch: the new path only runs for forms that use the extension. No log watch after release (owner's decision, 2026-11-25).

## Open points

- **OPEN:** Skjemabygger task for authoring the extension and SDC `calculatedExpression`.
