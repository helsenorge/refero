import React from 'react';

import DOMPurify from 'dompurify';
import { QuestionnaireItem } from 'fhir/r4';

import { getText } from '../../../util';

type Props = {
  item: QuestionnaireItem;
  text: string;
  renderHelpButton: () => JSX.Element;
  headerTag?: number;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
};
export const GroupHeader = ({ item, onRenderMarkdown, headerTag, renderHelpButton, text }: Props): JSX.Element | null => {
  if (!getText(item, onRenderMarkdown)) {
    return null;
  }

  const HeaderTag = `h${headerTag}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  const headerText = DOMPurify.sanitize(text, {
    RETURN_TRUSTED_TYPE: true,
    ADD_ATTR: ['target'],
  }) as unknown as string;
  return (
    <>
      <HeaderTag className={'page_refero__heading'} dangerouslySetInnerHTML={{ __html: headerText }} />
      {renderHelpButton()}
    </>
  );
};
