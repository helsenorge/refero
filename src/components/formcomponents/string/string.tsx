import * as React from 'react';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem, Questionnaire } from 'fhir/r4';
import { Controller } from 'react-hook-form';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';

import { debounce } from '@helsenorge/core-utils/debounce';
import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import { NewValueAction, newStringValueAsync } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import { getMinLengthExtensionValue, getPlaceholder, getRegexExtension, getValidationTextExtension } from '../../../util/extension';
import {
  isReadOnly,
  isRequired,
  getId,
  getStringValue,
  getPDFStringValue,
  getTextValidationErrorMessage,
  getSublabelText,
  renderPrefix,
  getText,
  getMaxLength,
} from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import { Resources } from '../../../util/resources';
import ReactHookFormHoc, { FormProps } from '../../../validation/ReactHookFormHoc';
import withCommonFunctions, { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';
import TextView from '../textview';

export interface Props extends WithCommonFunctionsAndEnhancedProps, FormProps {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire | null;
  responseItem: QuestionnaireResponseItem;
  answer: QuestionnaireResponseItemAnswer;
  path: Array<Path>;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  id?: string;
  resources?: Resources;
  oneToTwoColumn: boolean;
  visibleDeleteButton: boolean;
  renderDeleteButton: (className?: string) => JSX.Element | null;
  repeatButton: JSX.Element;
  validateScriptInjection: boolean;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  isHelpOpen?: boolean;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

export class String extends React.Component<Props, Record<string, unknown>> {
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

  shouldComponentUpdate(nextProps: Props): boolean {
    const responseItemHasChanged = this.props.responseItem !== nextProps.responseItem;
    const helpItemHasChanged = this.props.isHelpOpen !== nextProps.isHelpOpen;
    const answerHasChanged = this.props.answer !== nextProps.answer;
    const resourcesHasChanged = JSON.stringify(this.props.resources) !== JSON.stringify(nextProps.resources);
    const repeats = this.props.item.repeats ?? false;
    const newErrorMessage = this.props.error?.message !== nextProps.error?.message;
    return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || repeats || answerHasChanged || newErrorMessage;
  }

  getValidationErrorMessage = (value: string): string => {
    return getTextValidationErrorMessage(value, this.props.validateScriptInjection, this.props.item, this.props.resources);
  };

  getRequiredErrorMessage = (item: QuestionnaireItem): string | undefined => {
    return isRequired(item) ? this.props.resources?.formRequiredErrorMessage : undefined;
  };

  render(): JSX.Element | null {
    const { id, item, questionnaire, pdf, resources, answer, onRenderMarkdown, control, idWithLinkIdAndItemIndex } = this.props;
    if (pdf || isReadOnly(item)) {
      return (
        <TextView
          id={id}
          item={item}
          value={getPDFStringValue(answer, resources)}
          onRenderMarkdown={onRenderMarkdown}
          textClass="page_refero__component_readonlytext"
          helpButton={this.props.renderHelpButton()}
          helpElement={this.props.renderHelpElement()}
        >
          {this.props.children}
        </TextView>
      );
    }
    const labelText = `${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire, resources)}`;
    const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
    const maxLength = getMaxLength(item);
    const minLength = getMinLengthExtensionValue(item);
    const pattern = getRegexExtension(item);
    const errorMessage = getValidationTextExtension(item);
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
      event.persist();
      this.debouncedHandleChange(event);
    };
    return (
      <div className="page_refero__component page_refero__component_string">
        <FormGroup error={this.props.error?.message} mode="ongrey">
          {this.props.renderHelpElement()}
          <Controller
            name={idWithLinkIdAndItemIndex}
            control={control}
            defaultValue={getStringValue(answer)}
            shouldUnregister={true}
            rules={{
              required: {
                value: isRequired(item),
                message: resources?.formRequiredErrorMessage ?? 'Feltet er påkrevd',
              },
              ...(minLength && {
                minLength: {
                  value: minLength || 0,
                  message: errorMessage ?? resources?.stringOverMaxLengthError ?? 'Verdien er for kort',
                },
              }),
              ...(maxLength && {
                maxLength: {
                  value: maxLength,
                  message: errorMessage ?? resources?.stringOverMaxLengthError ?? 'Verdien er for lang',
                },
              }),
              ...(pattern && {
                pattern: {
                  value: new RegExp(pattern),
                  message: errorMessage ?? resources?.oppgiGyldigVerdi ?? 'Verdien er for lav',
                },
              }),
            }}
            render={({ field: { onChange, ref, name } }): JSX.Element => (
              <Input
                name={name}
                ref={ref}
                disabled={item.readOnly}
                label={
                  <Label
                    labelTexts={[{ text: labelText, type: 'semibold' }]}
                    sublabel={
                      <Sublabel
                        id={`${getId(this.props.id)}_sublabel`}
                        sublabelTexts={[{ text: subLabelText, hideFromScreenReader: false, type: 'normal' }]}
                      />
                    }
                    afterLabelChildren={this.props.renderHelpButton()}
                  />
                }
                onChange={(e): void => {
                  handleInputChange(e);
                  onChange(e.target.value);
                }}
                type="text"
                width={25}
                testId={getId(this.props.id)}
                inputId={getId(this.props.id)}
                placeholder={getPlaceholder(item)}
                className="page_refero__input"
              />
            )}
          />
          {this.props.renderDeleteButton('page_refero__deletebutton--margin-top')}
          {this.props.repeatButton}
        </FormGroup>
        {this.props.children ? <div className="nested-fieldset nested-fieldset--full-height">{this.props.children}</div> : null}
      </div>
    );
  }
}
const withFormProps = ReactHookFormHoc(String);
const withCommonFunctionsComponent = withCommonFunctions(withFormProps);
const layoutChangeComponent = layoutChange(withCommonFunctionsComponent);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(layoutChangeComponent);
export default connectedComponent;
