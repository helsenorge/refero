import * as React from 'react';

import { connect } from 'react-redux';

import designsystemtypography from '@helsenorge/designsystem-react/scss/typography.module.scss';

import { QuestionnaireItem } from '../../../types/fhir';
import { getMarkdownExtensionValue } from '../../../util/extension';
import { renderPrefix, getText } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';

export interface Props {
  item?: QuestionnaireItem;
  enable?: boolean;
  pdf?: boolean;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

const Display: React.SFC<Props> = ({ enable, pdf, item, onRenderMarkdown }) => {
  if (!enable) {
    return null;
  }
  let value: JSX.Element | undefined = undefined;
  if (item) {
    const markdown = item._text ? getMarkdownExtensionValue(item._text) : undefined;
    if (markdown) {
      value = (
        <div
          className={`page_skjemautfyller__markdown ${designsystemtypography['anchorlink-wrapper']}`}
          dangerouslySetInnerHTML={{
            __html: getText(item, onRenderMarkdown),
          }}
        />
      );
    } else {
      value = <p>{`${renderPrefix(item)} ${getText(item, onRenderMarkdown)}`}</p>;
    }
  }
  if (pdf) {
    if (!value) {
      return null;
    }
    return <div>{value}</div>;
  }
  return <div className="page_skjemautfyller__component page_skjemautfyller__component_display">{value}</div>;
};

const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(Display);
export default connectedComponent;
