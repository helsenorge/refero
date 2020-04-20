import * as React from 'react';
import { connect } from 'react-redux';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { renderPrefix, getText, markdownToHtml } from '../../../util/index';
import { QuestionnaireItem } from '../../../types/fhir';
import { getMarkdownExtensionValue } from '../../../util/extension';

export interface Props {
  item?: QuestionnaireItem;
  enable?: boolean;
  pdf?: boolean;
}

const Display: React.SFC<Props> = ({ enable, pdf, item }) => {
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
            __html: markdownToHtml(markdown.toString()),
          }}
        />
      );
    } else {
      value = <p>{`${renderPrefix(item)} ${getText(item)}`}</p>;
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
