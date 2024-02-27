import { Questionnaire, QuestionnaireItem } from 'fhir/r4';

import { RenderContextType } from '../../../constants/renderContextType';
import { getText, renderPrefix } from '../../../util';
import { getGroupItemControl } from '../../../util/group-item-control';
import { Path } from '../../../util/refero-core';
import { RenderContext } from '../../../util/renderContext';
import { Resources } from '../../../util/resources';

export const getColumns = (item: QuestionnaireItem): Array<string> => {
  const seenColumns = {};
  const columns: Array<string> = [];
  if (!item.item || item.item.length === 0) return columns;
  for (const group of item.item) {
    if (group.item && group.item.length > 0) {
      for (const cell of group.item) {
        const key = cell.text || '';
        if (key in seenColumns) continue;

        columns.push(key);
        seenColumns[key] = 1;
      }
    }
  }

  return columns;
};

export const getLocalRenderContextType = (item: QuestionnaireItem): RenderContextType => {
  const coding = getGroupItemControl(item);
  if (coding.length > 0) {
    switch (coding[0].code) {
      case 'grid':
        return RenderContextType.Grid;
    }
  }
  return RenderContextType.None;
};

export const isDirectChildOfRenderContextOwner = (path: Path[], item: QuestionnaireItem, renderContext: RenderContext): boolean => {
  const myIndex = path.findIndex(p => p.linkId === item.linkId);
  if (myIndex > 0) {
    const directParentLinkId = path[myIndex - 1].linkId;
    return directParentLinkId === renderContext.Owner;
  }

  return false;
};

export const getClassNames = (item: QuestionnaireItem): string => {
  const classNames = ['page_refero__component', 'page_refero__component_group'];
  const coding = getGroupItemControl(item);
  if (coding.length > 0) {
    classNames.push('page_refero__itemControl_' + coding[0].code);
  }

  return classNames.join(' ');
};

export const getHeaderText = (
  item: QuestionnaireItem,
  questionnaire?: Questionnaire,
  resources?: Resources,
  onRenderMarkdown?: ((item: QuestionnaireItem, markdown: string) => string) | undefined
): string => {
  return renderPrefix(item) + ' ' + getText(item, onRenderMarkdown, questionnaire, resources);
};
