import * as React from 'react';

import { connect } from 'react-redux';

import { Questionnaire, QuestionnaireItem } from '../../../types/fhir';

import designsystemtypography from '@helsenorge/designsystem-react/scss/typography.module.scss';

import itemControlConstants from '../../../constants/itemcontrol';
import { getItemControlExtensionValue, getMarkdownExtensionValue } from '../../../util/extension';
import { renderPrefix, getText, getId } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';

export interface Props {
  id?: string;
  item?: QuestionnaireItem;
  questionnaire?: Questionnaire | null;
  enable?: boolean;
  pdf?: boolean;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

const Display: React.SFC<Props> = ({ id, enable, pdf, item, questionnaire, onRenderMarkdown }) => {
  const itemControls = item ? getItemControlExtensionValue(item) : null;
  const highlightClass =
    itemControls && itemControls.some(itemControl => itemControl.code === itemControlConstants.HIGHLIGHT)
      ? 'page_skjemautfyller__component_highlight'
      : '';

  if (!enable) {
    return null;
  }
  let value: JSX.Element | undefined = undefined;
  if (item) {
    const markdown = item._text ? getMarkdownExtensionValue(item._text) : undefined;
    if (markdown) {
      value = (
        <div
          id={getId(id)}
          className={`page_skjemautfyller__markdown ${designsystemtypography['anchorlink-wrapper']}`}
          dangerouslySetInnerHTML={{
            __html: getText(item, onRenderMarkdown, questionnaire),
          }}
        />
      );
    } else {
      value = <p id={getId(id)}>{`${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire)}`}</p>;
    }
  }
  if (pdf) {
    if (!value) {
      return null;
    }
    return <div>{value}</div>;
  }

  return <div className={`page_skjemautfyller__component page_skjemautfyller__component_display ${highlightClass}`}>{value}</div>;
};

const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(Display);
export default connectedComponent;
