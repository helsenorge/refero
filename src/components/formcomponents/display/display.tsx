import * as React from 'react';

import DOMPurify from 'dompurify';

import { connect } from 'react-redux';

import { Questionnaire, QuestionnaireItem } from '../../../types/fhir';

import designsystemtypography from '@helsenorge/designsystem-react/scss/typography.module.scss';

import itemControlConstants from '../../../constants/itemcontrol';
import { getItemControlExtensionValue, getMarkdownExtensionValue } from '../../../util/extension';
import { renderPrefix, getText, getId } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Resources } from '../../../util/resources';

export interface Props {
  id?: string;
  item?: QuestionnaireItem;
  questionnaire?: Questionnaire | null;
  enable?: boolean;
  pdf?: boolean;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  resources?: Resources;
}

const Display: React.SFC<Props> = ({ id, enable, pdf, item, questionnaire, onRenderMarkdown, resources }) => {
  const itemControls = item ? getItemControlExtensionValue(item) : null;
  const highlightClass =
    itemControls && itemControls.some(itemControl => itemControl.code === itemControlConstants.HIGHLIGHT)
      ? 'page_refero__component_highlight'
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
          className={`page_refero__markdown ${designsystemtypography['anchorlink-wrapper']}`}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(getText(item, onRenderMarkdown, questionnaire, resources), {
              RETURN_TRUSTED_TYPE: true,
              ADD_ATTR: ['target'],
            }) as unknown as string,
          }}
        />
      );
    } else {
      value = <p id={getId(id)}>{`${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire, resources)}`}</p>;
    }
  }
  if (pdf) {
    if (!value) {
      return null;
    }
    return <div>{value}</div>;
  }

  return <div className={`page_refero__component page_refero__component_display ${highlightClass}`}>{value}</div>;
};

const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(Display);
export default connectedComponent;
