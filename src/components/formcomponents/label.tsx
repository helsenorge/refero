import * as React from 'react';

import { QuestionnaireItem } from '../../types/fhir';

import { getText, renderPrefix } from '../../util/index';

interface Props {
  item: QuestionnaireItem;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

const Label = ({ item, onRenderMarkdown }: Props): JSX.Element | null => {
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: `${renderPrefix(item)} ${getText(item, onRenderMarkdown)}`,
      }}
    />
  );
};

export default Label;
