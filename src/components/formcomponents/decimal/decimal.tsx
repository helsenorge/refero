import * as React from 'react';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import { decimalFormRegister } from './utils';
import { NewValueAction, newDecimalValueAsync } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import { getPlaceholder } from '../../../util/extension';
import { isReadOnly, getId, getSublabelText, renderPrefix, getText } from '../../../util/index';
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

  handleChange = (event: React.FormEvent): void => {
    const { dispatch, path, item, promptLoginMessage, onAnswerChange } = this.props;
    const value = parseFloat((event.target as HTMLInputElement).value);
    this.props.setValue(this.props.item.linkId, value);
    if (dispatch) {
      dispatch(newDecimalValueAsync(path, value, item))?.then(newState =>
        onAnswerChange(newState, path, item, { valueDecimal: value } as QuestionnaireResponseItemAnswer)
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
    const { id, item, pdf, onRenderMarkdown } = this.props;
    const value = this.getValue(this.props.item, this.props.answer);
    const labelText = `${renderPrefix(item)} ${getText(item, onRenderMarkdown, this.props.questionnaire, this.props.resources)}`;
    const subLabelText = getSublabelText(this.props.item, this.props.onRenderMarkdown, this.props.questionnaire, this.props.resources);

    if (pdf || isReadOnly(item)) {
      return (
        <TextView
          id={id}
          item={item}
          value={this.getPDFValue()}
          onRenderMarkdown={onRenderMarkdown}
          helpButton={this.props.renderHelpButton()}
          helpElement={this.props.renderHelpElement()}
        >
          {this.props.children}
        </TextView>
      );
    }
    //getValidationTextExtension(item)
    return (
      <div className="page_refero__component page_refero__component_decimal">
        {this.props.renderHelpElement()}
        <FormGroup error={this.props.error?.message} mode="ongrey">
          <Input
            {...decimalFormRegister(this.props.register, this.props.item, this.props.resources, value, this.handleChange)}
            type="number"
            inputId={getId(this.props.id)}
            name={getId(this.props.id)}
            value={value ? value + '' : ''}
            label={
              <Label
                htmlFor={getId(id)}
                labelTexts={[{ text: labelText, type: 'semibold' }]}
                sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
                afterLabelChildren={this.props.renderHelpButton()}
                statusDot={<div>{status}</div>}
              />
            }
            placeholder={getPlaceholder(item)}
            className="page_refero__input"
            onChange={this.handleChange}
            width={25}
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
