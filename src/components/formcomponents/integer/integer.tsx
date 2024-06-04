import * as React from 'react';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem, Questionnaire } from 'fhir/r4';
import { Controller } from 'react-hook-form';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import { NewValueAction, newIntegerValueAsync } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import { getPlaceholder, getMaxValueExtensionValue, getMinValueExtensionValue, getValidationTextExtension } from '../../../util/extension';
import { isReadOnly, isRequired, getId, getSublabelText, renderPrefix, getText } from '../../../util/index';
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
  resources?: Resources;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  path: Array<Path>;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  renderDeleteButton: (className?: string) => JSX.Element | null;
  id?: string;
  repeatButton: JSX.Element;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  isHelpOpen?: boolean;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

class Integer extends React.Component<Props, Record<string, unknown>> {
  getValue(): string | number | number[] | undefined {
    const { item, answer } = this.props;

    if (answer && Array.isArray(answer)) {
      return answer.map(m => m.valueInteger);
    }
    if (answer && answer.valueInteger !== undefined && answer.valueInteger !== null) {
      return answer.valueInteger;
    }
    if (!item || !item.initial || item.initial.length === 0 || !item.initial[0].valueInteger) {
      return '';
    }
  }

  getPDFValue(): string | number {
    const value = this.getValue();
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
    const { dispatch, promptLoginMessage, path, item, onAnswerChange } = this.props;

    const value = parseInt((event.target as HTMLInputElement).value, 10);
    if (dispatch) {
      dispatch(newIntegerValueAsync(this.props.path, value, this.props.item))?.then(newState =>
        onAnswerChange(newState, path, item, { valueInteger: value })
      );
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
      repeatButton,
      item,
      resources,
      id,
      onRenderMarkdown,
      renderHelpButton,
      renderHelpElement,
      children,
      pdf,
      questionnaire,
      control,
      error,
      renderDeleteButton,
      idWithLinkIdAndItemIndex,
    } = this.props;

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
    const value = this.getValue();
    const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
    const labelText = `${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire, resources)}`;
    const errorMessage = getValidationTextExtension(item);
    const minValue = getMinValueExtensionValue(item);
    const maxValue = getMaxValueExtensionValue(item);
    return (
      <div className="page_refero__component page_refero__component_integer">
        <FormGroup error={error?.message} mode="ongrey">
          {renderHelpElement()}
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
                  message: errorMessage ?? resources?.oppgiGyldigVerdi ?? 'Verdien er for høy',
                },
              }),
              ...(minValue && {
                min: {
                  value: minValue,
                  message: errorMessage ?? resources?.oppgiGyldigVerdi ?? 'Verdien er for lav',
                },
              }),
            }}
            render={({ field: { onChange, ...rest } }): JSX.Element => (
              <Input
                {...rest}
                type="number"
                value={Array.isArray(value) ? value.join(', ') : value}
                inputId={getId(id)}
                testId={getId(id)}
                label={
                  <Label
                    labelTexts={[{ text: labelText, type: 'semibold' }]}
                    sublabel={<Sublabel id={`${getId(id)}-select-sublabel`} sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
                    afterLabelChildren={renderHelpButton()}
                  />
                }
                onChange={(e): void => {
                  onChange(e.target.value);
                  this.handleChange(e);
                }}
                placeholder={getPlaceholder(item)}
                className="page_refero__input"
                width={25}
              />
            )}
          />
          {renderDeleteButton('page_refero__deletebutton--margin-top')}
          {repeatButton}
        </FormGroup>
        {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
      </div>
    );
  }
}

const withFormProps = ReactHookFormHoc(Integer);
const withCommonFunctionsComponent = withCommonFunctions(withFormProps);
const layoytChangeComponent = layoutChange(withCommonFunctionsComponent);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(layoytChangeComponent);
export default connectedComponent;
