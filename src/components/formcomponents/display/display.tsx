import * as React from 'react';
import { connect } from 'react-redux';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { renderPrefix, getText } from '../../../util/index';
import { QuestionnaireItem } from '../../../types/fhir';
import { getMarkdownExtensionValue } from '../../../util/extension';
import * as marked from 'marked';

const renderer = new marked.Renderer();
renderer.link = (href: string, title: string, text: string) => {
  return `<a href=${href} title=${title} target="_blank" class="external">${text}</a>`;
};

marked.setOptions({
  sanitize: true,
  renderer: renderer,
});

export interface Props {
  item?: QuestionnaireItem;
  enable?: boolean;
  pdf?: boolean;
}

const Display: React.SFC<Props> = ({ enable, pdf, item }) => {
  if (!enable) {
    return null;
  }
  let value = undefined;
  if (item) {
    const markdown = item._text ? getMarkdownExtensionValue(item._text) : undefined;
    if (markdown) {
      value = (
        <div
          className="page_skjemautfyller__markdown"
          dangerouslySetInnerHTML={{
            __html: marked(markdown.toString(), { renderer }),
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

const connectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(Display);
export default connectedComponent;
