import * as React from 'react';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { Controller } from 'react-hook-form';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import { NewValueAction, newDecimalValueAsync } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import { getMaxValueExtensionValue, getMinValueExtensionValue, getPlaceholder, getValidationTextExtension } from '../../../util/extension';
import { isReadOnly, getId, getSublabelText, renderPrefix, getText, getDecimalPattern, isRequired } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import { Resources } from '../../../util/resources';
import ReactHookFormHoc, { FormProps } from '../../../validation/ReactHookFormHoc';
import withCommonFunctions, { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';
import TextView from '../textview';

export interface Props extends WithCommonFunctionsAndEnhancedProps, FormProps {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  responseItem: QuestionnaireItem;
  answer: QuestionnaireResponseItemAnswer;
  resources?: Resources;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  path: Array<Path>;
  id?: string;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  renderDeleteButton: (className?: string) => JSX.Element | null;
  repeatButton: JSX.Element;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  isHelpOpen?: boolean;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

class Decimal extends React.Component<Props, Record<string, unknown>> {
  getValue = (item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer): string | number | number[] | undefined => {
    if (answer && Array.isArray(answer)) {
      return answer.map(m => m.valueDecimal);
    }
    if (answer && answer.valueDecimal !== undefined && answer.valueDecimal !== null) {
      return answer.valueDecimal;
    }
    if (!item || !item.initial || item.initial.length === 0 || !item.initial[0].valueDecimal) {
      return '';
    }
  };

  getPDFValue(): string | number {
    const value = this.getValue(this.props.item, this.props.answer);
    if (value === undefined || value === null || value === '') {
      let text = '';
      if (this.props.resources && this.props.resources.ikkeBesvart) {
        text = this.props.resources.ikkeBesvart;
      }
      return text;
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return value;
  }

  handleChange = (event: React.FormEvent<HTMLInputElement>): void => {
    const { dispatch, path, item, promptLoginMessage, onAnswerChange } = this.props;
    const value = parseFloat((event.target as HTMLInputElement).value);
    if (dispatch) {
      dispatch(newDecimalValueAsync(path, value, item))?.then(newState => {
        return onAnswerChange(newState, path, item, { valueDecimal: value } as QuestionnaireResponseItemAnswer);
      });
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  shouldComponentUpdate(nextProps: Props): boolean {
    const responseItemHasChanged = this.props.responseItem !== nextProps.responseItem;
    const helpItemHasChanged = this.props.isHelpOpen !== nextProps.isHelpOpen;
    const answerHasChanged = this.props.answer !== nextProps.answer;
    const resourcesHasChanged = JSON.stringify(this.props.resources) !== JSON.stringify(nextProps.resources);
    const repeats = this.props.item.repeats ?? false;
    const newErrorMessage = this.props.error?.message !== nextProps.error?.message;
    return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || repeats || answerHasChanged || newErrorMessage;
  }

  render(): JSX.Element | null {
    const {
      id,
      item,
      pdf,
      onRenderMarkdown,
      control,
      answer,
      questionnaire,
      resources,
      renderHelpButton,
      renderHelpElement,
      children,
      error,
      idWithLinkIdAndItemIndex,
    } = this.props;
    const value = this.getValue(item, answer);
    const labelText = `${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire, resources)}`;
    const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
    if (pdf || isReadOnly(item)) {
      return (
        <TextView
          id={id}
          item={item}
          value={this.getPDFValue()}
          onRenderMarkdown={onRenderMarkdown}
          helpButton={renderHelpButton()}
          helpElement={renderHelpElement()}
        >
          {children}
        </TextView>
      );
    }
    const decimalPattern = getDecimalPattern(item);
    const maxValue = getMaxValueExtensionValue(item);
    const minValue = getMinValueExtensionValue(item);
    const validationText = getValidationTextExtension(item);
    return (
      <div className="page_refero__component page_refero__component_decimal">
        {renderHelpElement()}
        <FormGroup error={error?.message} mode="ongrey">
          <Controller
            name={idWithLinkIdAndItemIndex}
            control={control}
            shouldUnregister={true}
            rules={{
              required: {
                value: isRequired(item),
                message: resources?.formRequiredErrorMessage ?? 'Feltet er påkrevd',
              },
              ...(maxValue && {
                max: {
                  value: maxValue,
                  message: validationText ?? resources?.oppgiGyldigVerdi ?? 'Verdien er for høy',
                },
              }),
              ...(minValue && {
                min: {
                  value: minValue,
                  message: validationText ?? resources?.oppgiGyldigVerdi ?? 'Verdien er for lav',
                },
              }),
              ...(decimalPattern && {
                pattern: {
                  value: new RegExp(decimalPattern),
                  message: resources?.oppgiGyldigVerdi ?? 'Verdien er ikke et gyldig tall',
                },
              }),
            }}
            render={({ field: { onChange, ...rest } }): JSX.Element => (
              <Input
                {...rest}
                type="number"
                inputId={getId(this.props.id)}
                name={getId(this.props.id)}
                value={value ? value + '' : ''}
                label={
                  <Label
                    className="page_refero__label"
                    htmlFor={getId(id)}
                    testId={`${getId(this.props.id)}-label-decimal`}
                    labelTexts={[{ text: labelText, type: 'semibold' }]}
                    sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
                    afterLabelChildren={this.props.renderHelpButton()}
                    statusDot={<div>{status}</div>}
                  />
                }
                placeholder={getPlaceholder(item)}
                className="page_refero__input"
                onChange={(e): void => {
                  this.handleChange(e);
                  onChange(e.target.value);
                }}
                width={25}
              />
            )}
          />
        </FormGroup>
        {this.props.renderDeleteButton('page_refero__deletebutton--margin-top')}
        {this.props.repeatButton}
        {this.props.children ? <div className="nested-fieldset nested-fieldset--full-height">{this.props.children}</div> : null}
      </div>
    );
  }
}

const withFormProps = ReactHookFormHoc(Decimal);
const withCommonFunctionsComponent = withCommonFunctions(withFormProps);
const layoutChangeComponent = layoutChange(withCommonFunctionsComponent);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(layoutChangeComponent);
export default connectedComponent;
