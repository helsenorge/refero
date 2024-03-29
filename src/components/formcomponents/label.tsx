import * as React from 'react';

import DOMPurify from 'dompurify';
import { QuestionnaireItem, Questionnaire } from 'fhir/r4';

import { getText, renderPrefix } from '../../util/index';
import { Resources } from '../../util/resources';

interface Props {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  resources?: Resources;
}

const Label = ({ item, onRenderMarkdown, questionnaire, resources }: Props): JSX.Element | null => {
  return (
    <span
      style={{ display: 'inline-block' }}
      className="page_refero__label"
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(`${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire, resources)}`, {
          RETURN_TRUSTED_TYPE: true,
          ADD_ATTR: ['target'],
        }) as unknown as string,
      }}
    />
  );
};

export default Label;
