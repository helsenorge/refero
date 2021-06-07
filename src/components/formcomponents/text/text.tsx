import * as React from 'react';

import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem } from '../../../types/fhir';

import { SafeTextarea } from '@helsenorge/toolkit/components/atoms/safe-textarea';
import { ExpandableSection } from '@helsenorge/toolkit/components/molecules/expandable-section';
import Validation from '@helsenorge/toolkit/components/molecules/form/validation';
import { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';

import { debounce } from '@helsenorge/core-utils/debounce';

import { NewValueAction, newStringValueAsync } from '../../../actions/newValue';
import Constants from '../../../constants/index';
import itemControlConstants from '../../../constants/itemcontrol';
import { GlobalState } from '../../../reducers';
import { getPlaceholder, getMinLengthExtensionValue, getItemControlExtensionValue, getRegexExtension } from '../../../util/extension';
import {
  isReadOnly,
  isRequired,
  getId,
  renderPrefix,
  getText,
  getStringValue,
  getMaxLength,
  getPDFStringValue,
  validateText,
  getTextValidationErrorMessage,
  getSublabelText,
} from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Resources } from '../../../util/resources';
import { Path } from '../../../util/skjemautfyller-core';
import withCommonFunctions from '../../with-common-functions';
import SubLabel from '../sublabel';
import TextView from '../textview';

export interface Props {
  item: QuestionnaireItem;
  responseItem: QuestionnaireResponseItem;
  answer: QuestionnaireResponseItemAnswer;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  path: Array<Path>;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  id?: string;
  repeatButton: JSX.Element;
  validateScriptInjection: boolean;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  resources?: Resources;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  isHelpOpen?: boolean;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}
export class Text extends React.Component<Props & ValidationProps, {}> {
  showCounter(): boolean {
    if (getMaxLength(this.props.item) || getMinLengthExtensionValue(this.props.item)) {
      return true;
    }
    return false;
  }

  handleChange = (event: React.FormEvent<{}>): void => {
    const { dispatch, promptLoginMessage, path, item, onAnswerChange } = this.props;
    const value = (event.target as HTMLInputElement).value;
    if (dispatch) {
      dispatch(newStringValueAsync(this.props.path, value, this.props.item))?.then(newState =>
        onAnswerChange(newState, path, item, { valueString: value } as QuestionnaireResponseItemAnswer)
      );
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  debouncedHandleChange: (event: React.FormEvent<{}>) => void = debounce(this.handleChange, 250, false);

  validateText = (value: string): boolean => {
    return this.validateWithRegex(value) && validateText(value, this.props.validateScriptInjection);
  };

  validateWithRegex = (value: string): boolean => {
    const regexAsStr = getRegexExtension(this.props.item);
    if (regexAsStr && value) {
      const regexp = new RegExp(regexAsStr);
      if (!regexp.test(value.toString())) {
        return false;
      }
    }

    return true;
  };

  getValidationErrorMessage = (value: string): string => {
    return getTextValidationErrorMessage(value, this.props.validateScriptInjection, this.props.item, this.props.resources);
  };

  getRequiredErrorMessage = (item: QuestionnaireItem): string | undefined => {
    return isRequired(item) ? this.props.resources?.formRequiredErrorMessage : undefined;
  };

  shouldComponentUpdate(nextProps: Props): boolean {
    const responseItemHasChanged = this.props.responseItem !== nextProps.responseItem;
    const helpItemHasChanged = this.props.isHelpOpen !== nextProps.isHelpOpen;
    const resourcesHasChanged = JSON.stringify(this.props.resources) !== JSON.stringify(nextProps.resources);
    const repeats = this.props.item.repeats ?? false;

    return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || repeats;
  }

  render(): JSX.Element | null {
    const { item, answer, pdf, children, resources, onRenderMarkdown, ...other } = this.props;
    const itemControls = getItemControlExtensionValue(item);

    if (itemControls && itemControls.some(itemControl => itemControl.code === itemControlConstants.SIDEBAR)) {
      return null;
    }

    if (itemControls && itemControls.some(itemControl => itemControl.code === itemControlConstants.INLINE)) {
      return (
        <ExpandableSection label={item.text} inlineButton rightArrow>
          <React.Fragment>{children}</React.Fragment>
        </ExpandableSection>
      );
    }

    if (itemControls && itemControls.some(itemControl => itemControl.code === itemControlConstants.HIGHLIGHT)) {
      return (
        <div
          className="page_skjemautfyller__component page_skjemautfyller__component_highlight"
          dangerouslySetInnerHTML={{
            __html: `${getText(item, onRenderMarkdown)}`,
          }}
        />
      );
    }

    if (pdf || isReadOnly(item)) {
      return (
        <TextView
          item={item}
          value={getPDFStringValue(answer)}
          onRenderMarkdown={onRenderMarkdown}
          textClass="page_skjemautfyller__component_readonlytext"
        >
          {this.props.children}
        </TextView>
      );
    }
    const subLabelText = getSublabelText(item, onRenderMarkdown);

    return (
      <div className="page_skjemautfyller__component page_skjemautfyller__component_text">
        <Validation {...other}>
          <SafeTextarea
            id={getId(this.props.id)}
            rows={Constants.DEFAULT_TEXTAREA_HEIGHT}
            value={getStringValue(answer)}
            isRequired={isRequired(item)}
            showLabel={true}
            label={`${renderPrefix(item)} ${getText(item, onRenderMarkdown)}`}
            subLabel={subLabelText ? <SubLabel subLabelText={subLabelText} /> : undefined}
            placeholder={getPlaceholder(item)}
            maxlength={getMaxLength(item)}
            minlength={getMinLengthExtensionValue(item)}
            counter={this.showCounter()}
            onChange={(event: React.FormEvent<{}>): void => {
              event.persist();
              this.debouncedHandleChange(event);
            }}
            validator={this.validateText}
            errorMessage={this.getValidationErrorMessage}
            requiredErrorMessage={this.getRequiredErrorMessage(item)}
            helpButton={this.props.renderHelpButton()}
            helpElement={this.props.renderHelpElement()}
            validateOnExternalUpdate={true}
            stringOverMaxLengthError={resources?.stringOverMaxLengthError}
            maxLengthText={resources?.maxLengthText}
          />
        </Validation>
        {this.props.renderDeleteButton('page_skjemautfyller__deletebutton--margin-top')}
        {this.props.repeatButton}
        {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
      </div>
    );
  }
}

const withCommonFunctionsComponent = withCommonFunctions(Text);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedComponent;
