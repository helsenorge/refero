import type { QuestionnaireItem, QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import { SortDirection } from '@helsenorge/designsystem-react/components/Table';

import { sortRowsByKey } from './sorting';

import { isHiddenItem } from '@/util';
import { isEnableWhenEnabled } from '@/util/isEnableWhenEnabled';
import { createPathForItem, getResponseItemsWithLinkId, type Path } from '@/util/refero-core';

/**
 * What a gtable needs before its rows render. The cells are the item components themselves, rendered in a table
 * context, and they decide hidden and enableWhen per row like everywhere else in the form.
 */

function descendantLinkIds(item: QuestionnaireItem): Set<string> {
  const ids = new Set<string>();
  (function walk(items?: QuestionnaireItem[]): void {
    for (const child of items ?? []) {
      ids.add(child.linkId);
      walk(child.item);
    }
  })(item.item);
  return ids;
}

/**
 * The questions shown as columns, by linkId: the group's questions without hidden ones. A question turned off by a
 * condition on a question outside the group is off in every row, so its column is left out; that is checked once.
 * A condition inside the group can differ per row, so the column stays and the cells are empty where it is off.
 */
export function getVisibleColumns(
  group: QuestionnaireItem,
  firstOccurrencePath: Path[],
  responseItems: QuestionnaireResponseItem[] | undefined
): string[] {
  const inGroup = descendantLinkIds(group);
  return (group.item ?? [])
    .filter(question => question.type !== 'group' && question.type !== 'display' && !isHiddenItem(question))
    .filter(question => {
      if (!question.enableWhen?.length || question.enableWhen.some(condition => inGroup.has(condition.question))) return true;
      const path = createPathForItem(firstOccurrencePath, question, 0);
      return isEnableWhenEnabled(question.enableWhen, question.enableBehavior, path, responseItems);
    })
    .map(question => question.linkId);
}

/**
 * An answer as a value to sort on: the raw value, not the displayed text, so dates (ISO), times and numbers sort
 * as dates, times and numbers. A choice sorts on its display text.
 */
function toSortValue(answer: QuestionnaireResponseItemAnswer): string | undefined {
  if (answer.valueString != null) return answer.valueString;
  if (answer.valueDate != null) return answer.valueDate;
  if (answer.valueDateTime != null) return answer.valueDateTime;
  if (answer.valueTime != null) return answer.valueTime;
  if (answer.valueInteger != null) return String(answer.valueInteger);
  if (answer.valueDecimal != null) return String(answer.valueDecimal);
  if (answer.valueQuantity?.value != null) return String(answer.valueQuantity.value);
  if (answer.valueCoding) return answer.valueCoding.display ?? answer.valueCoding.code;
  if (answer.valueBoolean != null) return answer.valueBoolean ? '1' : '0';
  return undefined;
}

/** The value of one column in each occurrence, to sort on. With several answers the first one counts. */
export function getSortValues(occurrences: QuestionnaireResponseItem[], linkId: string): string[] {
  return occurrences.map(occurrence => {
    const answers = getResponseItemsWithLinkId(linkId, occurrence.item).flatMap(item => item.answer ?? []);
    return answers.map(toSortValue).find(value => value !== undefined && value !== '') ?? '';
  });
}

/** The occurrences in display order (their indexes), sorted by one column's values. Empty values come last. */
export function getSortedOrder(values: string[], direction: SortDirection = SortDirection.asc): number[] {
  const rows = values.map((value, index) => ({ _rowIndex: String(index), value: value || undefined }));
  return sortRowsByKey(rows, 'value', direction).map(row => Number(row._rowIndex));
}
