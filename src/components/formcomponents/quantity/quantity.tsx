import * as React from 'react';

import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import {
  QuestionnaireItem,
  QuestionnaireResponseItemAnswer,
  Quantity as QuantityType,
  QuestionnaireResponseItem,
  Questionnaire,
} from '../../../types/fhir';

import Validation from '@helsenorge/form/components/form/validation';
import { ValidationProps } from '@helsenorge/form/components/form/validation';
import SafeInputField from '@helsenorge/form/components/safe-input-field';

import { NewValueAction, newQuantityValueAsync } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import {
  getValidationTextExtension,
  getPlaceholder,
  getMaxValueExtensionValue,
  getMinValueExtensionValue,
  getQuestionnaireUnitExtensionValue,
} from '../../../util/extension';
import { isReadOnly, isRequired, getId, getDecimalPattern, getSublabelText } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Resources } from '../../../util/resources';
import { Path } from '../../../util/skjemautfyller-core';
import withCommonFunctions from '../../with-common-functions';
import Label from '../label';
import SubLabel from '../sublabel';
import TextView from '../textview';

export interface Props {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  responseItem: QuestionnaireResponseItem;
  answer: QuestionnaireResponseItemAnswer;
  resources?: Resources;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  path: Array<Path>;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  id?: string;
  repeatButton: JSX.Element;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  isHelpOpen?: boolean;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

class Quantity extends React.Component<Props & ValidationProps, {}> {
  getValue(): number | undefined {
    const { answer } = this.props;
    if (answer && answer.valueQuantity !== undefined && answer.valueQuantity !== null) {
      return answer.valueQuantity.value;
    }
  }

  getPDFValue(): string {
    const value = this.getValue();
    if (value === undefined || value === null) {
      let text = '';
      if (this.props.resources && this.props.resources.ikkeBesvart) {
        text = this.props.resources.ikkeBesvart;
      }
      return text;
    }
    return `${value} ${this.getUnit()}`;
  }

  handleChange = (event: React.FormEvent<{}>): void => {
    const { dispatch, promptLoginMessage, path, item, onAnswerChange } = this.props;
    const extension = getQuestionnaireUnitExtensionValue(this.props.item);
    if (extension) {
      const quantity = {
        unit: extension.display,
        system: extension.system,
        code: extension.code,
      } as QuantityType;

      const value = Number(parseFloat((event.target as HTMLInputElement).value));
      if (value != null && !isNaN(value) && isFinite(value)) {
        quantity.value = value;
      }

      if (dispatch) {
        dispatch(newQuantityValueAsync(this.props.path, quantity, this.props.item))?.then(newState =>
          onAnswerChange(newState, path, item, { valueQuantity: quantity } as QuestionnaireResponseItemAnswer)
        );
      }

      if (promptLoginMessage) {
        promptLoginMessage();
      }
    }
  };

  getUnit = (): string => {
    const valueCoding = getQuestionnaireUnitExtensionValue(this.props.item);
    if (valueCoding && valueCoding.display) {
      return valueCoding.display;
    }
    return '';
  };

  shouldComponentUpdate(nextProps: Props): boolean {
    const responseItemHasChanged = this.props.responseItem !== nextProps.responseItem;
    const helpItemHasChanged = this.props.isHelpOpen !== nextProps.isHelpOpen;
    const resourcesHasChanged = JSON.stringify(this.props.resources) !== JSON.stringify(nextProps.resources);
    const repeats = this.props.item.repeats ?? false;

    return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || repeats;
  }

  render(): JSX.Element | null {
    const { id, item, questionnaire, onRenderMarkdown } = this.props;
    if (this.props.pdf || isReadOnly(item)) {
      return (
        <TextView id={id} item={this.props.item} value={this.getPDFValue()} onRenderMarkdown={onRenderMarkdown}>
          {this.props.children}
        </TextView>
      );
    }
    const value = this.getValue();
    const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire);

    return (
      <div className="page_skjemautfyller__component page_skjemautfyller__component_quantity">
        <Validation {...this.props}>
          <SafeInputField
            size="xSmall"
            type="number"
            id={getId(this.props.id)}
            inputName={getId(this.props.id)}
            value={value !== undefined ? value + '' : ''}
            showLabel={true}
            label={<Label item={item} onRenderMarkdown={onRenderMarkdown} questionnaire={questionnaire} />}
            subLabel={subLabelText ? <SubLabel subLabelText={subLabelText} /> : undefined}
            isRequired={isRequired(item)}
            placeholder={getPlaceholder(item)}
            max={getMaxValueExtensionValue(item)}
            min={getMinValueExtensionValue(item)}
            onBlur={this.handleChange}
            errorMessage={getValidationTextExtension(item)}
            pattern={getDecimalPattern(item)}
            className="page_skjemautfyller__quantity"
            helpButton={this.props.renderHelpButton()}
            helpElement={this.props.renderHelpElement()}
            validateOnExternalUpdate={true}
          >
            <span className="page_skjemautfyller__unit">{this.getUnit()}</span>
          </SafeInputField>
        </Validation>
        <div>{this.props.repeatButton}</div>
        {this.props.children ? <div className="nested-fieldset nested-fieldset--full-height">{this.props.children}</div> : null}
      </div>
    );
  }
}

const withCommonFunctionsComponent = withCommonFunctions(Quantity);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedComponent;
