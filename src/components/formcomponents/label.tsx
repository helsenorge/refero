import * as React from 'react';

import DOMPurify from 'dompurify';
import { QuestionnaireItem, Questionnaire } from 'fhir/r4';

import { Resources } from '../../types/resources';

import { getText, renderPrefix } from '../../util/index';

interface Props {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire | null;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  resources?: Resources;
}

const Label = ({ item, onRenderMarkdown, questionnaire, resources }: Props): JSX.Element | null => {
  return (
    <span
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
