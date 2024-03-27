import React from 'react';

import classNames from 'classnames';
import DOMPurify from 'dompurify';
import { QuestionnaireItem } from 'fhir/r4';
import { Collapse } from 'react-collapse';

import ItemControl from '../constants/itemcontrol';
import { getText } from '../util';
import { findHelpItem, getHelpItemType } from '../util/help';

type Props = {
  item?: QuestionnaireItem;
  onRequestHelpElement?: (
    item: QuestionnaireItem,
    helpItem: QuestionnaireItem,
    helpItemType: string,
    helpText: string,
    isHelpVisible: boolean
  ) => JSX.Element;
  isHelpVisible: boolean;
};

export const HelpElement = ({ item, onRequestHelpElement, isHelpVisible }: Props): JSX.Element | null => {
  if (!item) {
    return null;
  }

  const helpItem = findHelpItem(item);
  if (!helpItem) {
    return null;
  }

  const helpItemType = getHelpItemType(helpItem) || ItemControl.HELP;

  if (onRequestHelpElement) {
    return onRequestHelpElement(item, helpItem, helpItemType, getText(helpItem), isHelpVisible);
  }

  const collapseClasses: string = classNames({
    page_refero__helpComponent: true,
    'page_refero__helpComponent--open': isHelpVisible,
  });
  return (
    <Collapse isOpened={isHelpVisible}>
      <div
        className={collapseClasses}
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(`${getText(helpItem)}`, { RETURN_TRUSTED_TYPE: true, ADD_ATTR: ['target'] }) as unknown as string,
        }}
      />
    </Collapse>
  );
};
