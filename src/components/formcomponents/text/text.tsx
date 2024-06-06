import * as React from 'react';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem } from 'fhir/r4';
import { Controller } from 'react-hook-form';
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
import {
  getPlaceholder,
  getMinLengthExtensionValue,
  getItemControlExtensionValue,
  getRegexExtension,
  getValidationTextExtension,
} from '../../../util/extension';
import {
  isReadOnly,
  isRequired,
  getId,
  getStringValue,
  getMaxLength,
  getPDFStringValue,
  getSublabelText,
  scriptInjectionValidation,
  getLabelText,
} from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import { Resources } from '../../../util/resources';
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
  handleChange = (event: React.FormEvent): void => {
    const { dispatch, promptLoginMessage, path, item, onAnswerChange } = this.props;
    const value = (event.target as HTMLInputElement).value;
    if (dispatch) {
      dispatch(newStringValueAsync(this.props.path, value, this.props.item))?.then(newState =>
        onAnswerChange(newState, path, item, { valueString: value })
      );
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  debouncedHandleChange: (event: React.FormEvent) => void = debounce(this.handleChange, 250, false);

  shouldComponentUpdate(nextProps: Props): boolean {
    const responseItemHasChanged = this.props.responseItem !== nextProps.responseItem;
    const helpItemHasChanged = this.props.isHelpOpen !== nextProps.isHelpOpen;
    const answerHasChanged = this.props.answer !== nextProps.answer;
    const resourcesHasChanged = JSON.stringify(this.props.resources) !== JSON.stringify(nextProps.resources);
    const repeats = this.props.item.repeats ?? false;
    const newErrorMessage = this.props.error?.message !== nextProps.error?.message;

    return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || repeats || answerHasChanged || newErrorMessage;
  }

  onTextAreaChange = (event: React.FormEvent<HTMLTextAreaElement>): void => {
    event.persist();
    this.debouncedHandleChange(event);
  };

  render(): JSX.Element | null {
    const { id, item, answer, pdf, children, resources, onRenderMarkdown, questionnaire, control, idWithLinkIdAndItemIndex } = this.props;
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
            {children}
          </Expander>
        </div>
      );
    }

    if (pdf || isReadOnly(item)) {
      return (
        <TextView
          id={id}
          item={item}
          value={getPDFStringValue(answer, this.props.resources)}
          onRenderMarkdown={onRenderMarkdown}
          textClass="page_refero__component_readonlytext"
          helpButton={this.props.renderHelpButton()}
          helpElement={this.props.renderHelpElement()}
        >
          {this.props.children}
        </TextView>
      );
    }

    const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
    const labelText = getLabelText(item, onRenderMarkdown, questionnaire, resources);

    const value = getStringValue(answer);
    const maxLength = getMaxLength(item);
    const minLength = getMinLengthExtensionValue(item);
    const pattern = getRegexExtension(item);
    const validationTextMessage = getValidationTextExtension(item);

    return (
      <div className="page_refero__component page_refero__component_text">
        <FormGroup error={this.props.error?.message} mode="ongrey">
          {this.props.renderHelpElement()}
          <Controller
            name={idWithLinkIdAndItemIndex}
            defaultValue={value || ''}
            control={control}
            shouldUnregister={true}
            rules={{
              required: {
                value: isRequired(item),
                message: this.props.resources?.formRequiredErrorMessage || 'Verdien er påkrevd',
              },
              ...(minLength && {
                minLength: {
                  value: minLength || 0,
                  message: validationTextMessage ?? resources?.stringOverMaxLengthError ?? 'Verdien er for kort',
                },
              }),
              ...(maxLength && {
                maxLength: {
                  value: maxLength,
                  message: validationTextMessage ?? resources?.stringOverMaxLengthError ?? 'Verdien er for lang',
                },
              }),
              ...(pattern && {
                pattern: {
                  value: new RegExp(pattern),
                  message: validationTextMessage ?? resources?.oppgiGyldigVerdi ?? 'Verdien er for lav',
                },
              }),
              ...(this.props.validateScriptInjection && {
                validate: (value: string): true | string => scriptInjectionValidation(value, resources),
              }),
            }}
            render={({ field: { onChange, name, ref } }): JSX.Element => (
              <Textarea
                ref={ref}
                name={name}
                defaultValue={value}
                onChange={(e): void => {
                  this.onTextAreaChange(e);
                  onChange(e?.target?.value);
                }}
                textareaId={getId(id)}
                maxRows={Constants.DEFAULT_TEXTAREA_HEIGHT}
                placeholder={getPlaceholder(item)}
                testId={`${getId(this.props.id)}-text`}
                label={
                  <Label
                    testId={`${getId(this.props.id)}-text-label`}
                    className="page_refero__label"
                    labelTexts={[{ text: labelText, type: 'semibold' }]}
                    sublabel={<Sublabel id={`${getId(this.props.id)}-sublabel`} sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
                    afterLabelChildren={this.props.renderHelpButton()}
                  />
                }
                grow={true}
                maxCharacters={maxLength}
                maxText={maxLength ? resources?.maxLengthText?.replace('{0}', `${maxLength}`) : ''}
              />
            )}
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
