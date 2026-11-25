# Acceptance criteria: PDR-REFERO-001

Godkjent av: Reuben Ringdal, 2026-11-25 (intervju)

The criteria are the contract for the black box tests (ADR-SKILLS-008). Each criterion has status `test` or `manuell: <reason>`. If a
criterion changes, it is written in the changelog at the bottom before the test changes.

Each criterion has an id (`K1`, `K2` …), Gitt, Når and Så, and a status. A test names both the PDR id and the criterion
(`K5 (PDR-REFERO-001)`). `grensesnitt` means the QuestionnaireResponse refero produces for a Questionnaire; `brukerflate` means the rendered
form.

Terms used below:

- **The extension**: `http://helsenorge.no/fhir/StructureDefinition/sdf-item-repetition-context` with a `valueExpression` (`language`
  `text/fhirpath`, `name` `row`).
- **SDC calc**: `http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression` with a `valueExpression`.
- **sdf calc**: `http://ehelse.no/fhir/StructureDefinition/sdf-calculatedExpression` with a `valueString`.
- **The medicine data**: a repeating group `medisin` with the strings `medisin.navn` and `medisin.dose`, answered twice: "Paracet" / "1 g"
  and "Ibux" / "400 mg".

## K1: A group gets one repetition per selected item

- **Gitt** the medicine data, and a repeating group `kopi` with `readOnly` true and the extension with expression
  `%resource.repeat(item).where(linkId='medisin')`,
- **når** the response is calculated,
- **så** the response has two occurrences of `kopi`, in the same order as the two `medisin` occurrences.

Status: `test` Nivå: `grensesnitt`

## K2: The repetitions follow the source

- **Gitt** K1,
- **når** a third `medisin` is answered, and then the first `medisin` is removed,
- **så** `kopi` has three occurrences after the first change and two after the second, matching the `medisin` occurrences each time.

Status: `test` Nivå: `grensesnitt`

## K3: SDC calc in a repetition reads its own row

- **Gitt** K1, where `kopi` has a string child `kopi.navn` with SDC calc `%row.item.where(linkId='medisin.navn').answer.value`, and the
  second `medisin` has no answer to `medisin.navn`,
- **når** the response is calculated,
- **så** the first `kopi` has `kopi.navn` "Paracet" and the second `kopi` has no answer to `kopi.navn`; no value moves to another
  occurrence.

Status: `test` Nivå: `grensesnitt`

## K4: sdf calc in a repetition reads its own row

- **Gitt** K1, where `kopi` has a string child `kopi.dose` with sdf calc `%row.item.where(linkId='medisin.dose').answer.value`,
- **når** the response is calculated,
- **så** the two `kopi` occurrences have `kopi.dose` "1 g" and "400 mg".

Status: `test` Nivå: `grensesnitt`

## K5: Other expressions under the item see the row

- **Gitt** K1, where `kopi` has a string child `kopi.kopiert` with a `cqf-expression` (`valueExpression`)
  `%row.item.where(linkId='medisin.navn').answer.value`,
- **når** the response is calculated,
- **så** the two `kopi` occurrences have `kopi.kopiert` "Paracet" and "Ibux".

Status: `test` Nivå: `grensesnitt`

## K6: Plain values give one repetition each

- **Gitt** the medicine data, and a repeating readOnly group `navneliste` with the extension
  `%resource.repeat(item).where(linkId='medisin.navn').answer.value` and a string child `navneliste.navn` with SDC calc `%row`,
- **når** the response is calculated,
- **så** `navneliste` has two occurrences with `navneliste.navn` "Paracet" and "Ibux".

Status: `test` Nivå: `grensesnitt`

## K7: An empty result gives no repetitions

- **Gitt** K1, but with the expression `%resource.repeat(item).where(linkId='finnes-ikke')`,
- **når** the response is calculated,
- **så** the response has no occurrence of `kopi`.

Status: `test` Nivå: `grensesnitt`

## K8: A repeating question gets one answer per element, with its own details

- **Gitt** the medicine data, and a repeating readOnly string question `alle-medisiner` with the extension
  `%resource.repeat(item).where(linkId='medisin')`, SDC calc `%row.item.where(linkId='medisin.navn').answer.value`, and a nested string
  question `alle-medisiner.dose` with SDC calc `%row.item.where(linkId='medisin.dose').answer.value`,
- **når** the response is calculated,
- **så** `alle-medisiner` has two answers, "Paracet" with nested `alle-medisiner.dose` "1 g", and "Ibux" with nested `alle-medisiner.dose`
  "400 mg".

Status: `test` Nivå: `grensesnitt`

## K9: A repeating question without its own calc uses the elements

- **Gitt** the medicine data, and a repeating readOnly string question `navn-kopi` with the extension
  `%resource.repeat(item).where(linkId='medisin.navn')` and no calc,
- **når** the response is calculated,
- **så** `navn-kopi` has the answers "Paracet" and "Ibux"; with the expression `%resource.repeat(item).where(linkId='medisin')` instead
  (groups, which have no answer) it has no answers.

Status: `test` Nivå: `grensesnitt`

## K10: Without readOnly the extension is ignored

- **Gitt** K1, but `kopi` has no `readOnly`,
- **når** the response is calculated,
- **så** `kopi` has the occurrences the response already had (one in a new response), not one per `medisin`.

Status: `test` Nivå: `grensesnitt`

## K11: No add or delete buttons

- **Gitt** the form from K1,
- **når** the form is shown,
- **så** there is no button to add a `kopi` and no button to delete one.

Status: `test` Nivå: `brukerflate`

## K12: SDC calc works outside repetitions

- **Gitt** a decimal question `sum` with SDC calc
  `%resource.repeat(item).where(linkId='a').answer.value + %resource.repeat(item).where(linkId='b').answer.value`, and decimal questions `a`
  = 2 and `b` = 3,
- **når** `b` is changed to 5,
- **så** `sum` is 5 before the change and 7 after it. If `sum` also has an sdf calc, the SDC calc decides the value.

Status: `test` Nivå: `grensesnitt`

## K13: A gtable goes to the right table

- **Gitt** a group with itemControl `gtable` and the setup from K1, and a second gtable group without the extension whose columns are
  questions with `cqf-expression` copying lists from the whole response,
- **når** the form is shown,
- **så** the first is a table with one row per `kopi` occurrence, and the second is shown as it was before this change.

Status: `test` Nivå: `brukerflate`

## K14: cqf-expression on a group creates no repetitions

- **Gitt** K1, but the group has a `cqf-expression` with the same expression instead of the extension,
- **når** the response is calculated,
- **så** `kopi` has the occurrences the response already had, not one per `medisin`.

Status: `test` Nivå: `grensesnitt`

## K15: Value copy on a question is unchanged

- **Gitt** a string question `kopi-av-navn`, outside any repetition, with `cqf-expression` (`valueString`)
  `QuestionnaireResponse.descendants().where(linkId='kilde').answer.value`, and a string question `kilde` answered "Hei",
- **når** the response is calculated,
- **så** `kopi-av-navn` has the answer "Hei".

Status: `test` Nivå: `grensesnitt`

## Changelog

| Date       | Who            | Change        |
| ---------- | -------------- | ------------- |
| 2026-11-25 | Reuben Ringdal | First version |
