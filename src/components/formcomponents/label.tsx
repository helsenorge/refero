import * as React from 'react';

import DOMPurify from 'dompurify';

import { QuestionnaireItem, Questionnaire } from '../../types/fhir';

import { getText, renderPrefix } from '../../util/index';

interface Props {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

const Label = ({ item, onRenderMarkdown, questionnaire }: Props): JSX.Element | null => {
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(`${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire)}`, {
          RETURN_TRUSTED_TYPE: true,
        }) as unknown as string,
      }}
    />
  );
};

export default Label;
