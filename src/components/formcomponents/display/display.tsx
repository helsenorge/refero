import * as React from 'react';
import { connect } from 'react-redux';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { renderPrefix, getText } from '../../../util/index';
import { QuestionnaireItem } from '../../../types/fhir';
import { getMarkdownExtensionValue } from '../../../util/extension';

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
          className="page_skjemautfyller__markdown"
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
