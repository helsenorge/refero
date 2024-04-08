import * as React from 'react';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem, Questionnaire } from 'fhir/r4';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import Input from '@helsenorge/designsystem-react/components/Input';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import { NewValueAction, newIntegerValueAsync } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import { getPlaceholder, getMaxValueExtensionValue, getMinValueExtensionValue } from '../../../util/extension';
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

  handleChange = (event: React.FormEvent): void => {
    const { dispatch, promptLoginMessage, path, item, onAnswerChange } = this.props;

    const value = parseInt((event.target as HTMLInputElement).value, 10);
    this.props.setValue(this.props.item.linkId, value);
    if (dispatch) {
      dispatch(newIntegerValueAsync(this.props.path, value, this.props.item))?.then(newState =>
        onAnswerChange(newState, path, item, { valueInteger: value } as QuestionnaireResponseItemAnswer)
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

    return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || repeats || answerHasChanged;
  }

  render(): JSX.Element | null {
    if (this.props.pdf || isReadOnly(this.props.item)) {
      return (
        <TextView
          id={this.props.id}
          item={this.props.item}
          value={this.getPDFValue()}
          onRenderMarkdown={this.props.onRenderMarkdown}
          helpButton={this.props.renderHelpButton()}
          helpElement={this.props.renderHelpElement()}
        >
          {this.props.children}
        </TextView>
      );
    }
    const value = this.getValue();
    const subLabelText = getSublabelText(this.props.item, this.props.onRenderMarkdown, this.props.questionnaire, this.props.resources);
    const labelText = `${renderPrefix(this.props.item)} ${getText(
      this.props.item,
      this.props.onRenderMarkdown,
      this.props.questionnaire,
      this.props.resources
    )}`;
    return (
      <div className="page_refero__component page_refero__component_integer">
        {this.props.renderHelpElement()}
        <Input
          {...this.props.register(this.props.item.linkId, {
            required: isRequired(this.props.item),
            valueAsNumber: true,
          })}
          onChange={this.handleChange}
          type="number"
          value={value !== undefined && value !== null ? value + '' : ''}
          inputId={getId(this.props.id)}
          name={getId(this.props.id)}
          label={
            <Label
              labelTexts={[{ text: labelText, type: 'semibold' }]}
              sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
              afterLabelChildren={this.props.renderHelpButton()}
            />
          }
          required={isRequired(this.props.item)}
          placeholder={getPlaceholder(this.props.item)}
          defaultValue={value !== undefined && value !== null ? value + '' : ''}
          max={getMaxValueExtensionValue(this.props.item)}
          min={getMinValueExtensionValue(this.props.item)}
          // errorMessage={getValidationTextExtension(this.props.item)}
          className="page_refero__input"
          width={25}
        />
        {this.props.renderDeleteButton('page_refero__deletebutton--margin-top')}
        {this.props.repeatButton}
        {this.props.children ? <div className="nested-fieldset nested-fieldset--full-height">{this.props.children}</div> : null}
      </div>
    );
  }
}

const withFormProps = ReactHookFormHoc(Integer);
const withCommonFunctionsComponent = withCommonFunctions(withFormProps);
const layoytChangeComponent = layoutChange(withCommonFunctionsComponent);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(layoytChangeComponent);
export default connectedComponent;
