import * as React from 'react';

import DOMPurify from 'dompurify';
import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem } from 'fhir/r4';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import Expander from '@helsenorge/designsystem-react/components/Expander';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';
import Textarea from '@helsenorge/designsystem-react/components/Textarea';

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
  getText,
  getStringValue,
  getMaxLength,
  getPDFStringValue,
  validateText,
  getTextValidationErrorMessage,
  getSublabelText,
  renderPrefix,
} from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import { Resources } from '../../../util/resources';
import { SanitizeText } from '../../../util/sanitize/domPurifyHelper';
import ReactHookFormHoc, { FormProps } from '../../../validation/ReactHookFormHoc';
import withCommonFunctions, { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';
import TextView from '../textview';

export interface Props extends WithCommonFunctionsAndEnhancedProps, FormProps {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  responseItem: QuestionnaireResponseItem;
  answer: QuestionnaireResponseItemAnswer;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  path: Array<Path>;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  renderDeleteButton: (className?: string) => JSX.Element | null;
  id?: string;
  repeatButton: JSX.Element;
  validateScriptInjection: boolean;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  resources?: Resources;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  isHelpOpen?: boolean;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  shouldExpanderRenderChildrenWhenClosed?: boolean;
}
export class Text extends React.Component<Props> {
  showCounter(): boolean {
    if (getMaxLength(this.props.item) || getMinLengthExtensionValue(this.props.item)) {
      return true;
    }
    return false;
  }

  handleChange = (event: React.FormEvent): void => {
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

  debouncedHandleChange: (event: React.FormEvent) => void = debounce(this.handleChange, 250, false);

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
    const answerHasChanged = this.props.answer !== nextProps.answer;
    const resourcesHasChanged = JSON.stringify(this.props.resources) !== JSON.stringify(nextProps.resources);
    const repeats = this.props.item.repeats ?? false;

    return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || repeats || answerHasChanged;
  }
  onTextAreaChange = (event: React.FormEvent<HTMLTextAreaElement>): void => {
    event.persist();
    this.debouncedHandleChange(event);
  };
  render(): JSX.Element | null {
    const { id, item, answer, pdf, children, resources, onRenderMarkdown, questionnaire } = this.props;
    const itemControls = getItemControlExtensionValue(item);

    if (itemControls && itemControls.some(itemControl => itemControl.code === itemControlConstants.SIDEBAR)) {
      return null;
    }

    if (itemControls && itemControls.some(itemControl => itemControl.code === itemControlConstants.INLINE)) {
      return (
        <div id={id} className="page_refero__component page_refero__component_expandabletext">
          <Expander
            title={item.text ? item.text : ''}
            renderChildrenWhenClosed={this.props.shouldExpanderRenderChildrenWhenClosed ? true : false}
          >
            <React.Fragment>{children}</React.Fragment>
          </Expander>
        </div>
      );
    }

    if (itemControls && itemControls.some(itemControl => itemControl.code === itemControlConstants.HIGHLIGHT)) {
      return (
        <div
          id={id}
          className="page_refero__component page_refero__component_highlight"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(`${getText(item, onRenderMarkdown, questionnaire, resources)}`, {
              RETURN_TRUSTED_TYPE: true,
              ADD_ATTR: ['target'],
            }) as unknown as string,
          }}
        />
      );
    }

    if (pdf || isReadOnly(item)) {
      return (
        <TextView
          id={id}
          item={item}
          value={getPDFStringValue(answer)}
          onRenderMarkdown={onRenderMarkdown}
          textClass="page_refero__component_readonlytext"
          helpButton={this.props.renderHelpButton()}
          helpElement={this.props.renderHelpElement()}
        >
          {this.props.children}
        </TextView>
      );
    }

    const labelText = SanitizeText(`${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire, resources)}`) || '';
    const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);

    return (
      <div className="page_refero__component page_refero__component_text">
        <FormGroup error={''} mode="ongrey">
          {this.props.renderHelpElement()}
          <Textarea
            {...this.props.register(this.props.item.linkId, {
              required: isRequired(this.props.item),
            })}
            onChange={this.onTextAreaChange}
            textareaId={getId(id)}
            maxRows={Constants.DEFAULT_TEXTAREA_HEIGHT}
            placeholder={getPlaceholder(item)}
            label={
              <Label
                labelTexts={[{ text: labelText, type: 'semibold' }]}
                sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
                afterLabelChildren={this.props.renderHelpButton()}
              />
            }
            defaultValue={getStringValue(answer)}
            grow={true}
            maxCharacters={getMaxLength(item)}
            maxText={getMaxLength(item) ? resources?.maxLengthText?.replace('{0}', `${getMaxLength(item)}`) : ''}
          />
          {this.props.renderDeleteButton('page_refero__deletebutton--margin-top')}
          {this.props.repeatButton}
        </FormGroup>
        {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
      </div>
    );
  }
}

const withFormProps = ReactHookFormHoc(Text);
const withCommonFunctionsComponent = withCommonFunctions(withFormProps);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedComponent;
