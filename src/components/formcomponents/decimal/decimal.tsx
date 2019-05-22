import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import SafeInputField from '@helsenorge/toolkit/components/atoms/safe-input-field';
import layoutChange from '@helsenorge/toolkit/higher-order-components/layoutChange';
import Validation from '@helsenorge/toolkit/components/molecules/form/validation';
import { ValidationProps } from '@helsenorge/toolkit/components/molecules/form/validation';
import ExtensionConstants from '../../../constants/extensions';
import { Extension } from '../../../types/fhir';
import { Path } from '../../../util/skjemautfyller-core';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { newDecimalValue } from '../../../actions/newValue';
import { QuestionnaireItem, QuestionnaireResponseAnswer } from '../../../types/fhir';
import { Resources } from '../../../util/resources';
import { isReadOnly, isRequired, getId, renderPrefix, getText } from '../../../util/index';
import {
  getValidationTextExtension,
  getPlaceholder,
  getExtension,
  getMaxValueExtensionValue,
  getMinValueExtensionValue,
} from '../../../util/extension';
import withCommonFunctions from '../../with-common-functions';
import TextView from '../textview';

interface DecimalInputFieldProps {
  step?: string;
}

export interface Props {
  item: QuestionnaireItem;
  answer: QuestionnaireResponseAnswer;
  resources?: Resources;
  dispatch?: Dispatch<{}>;
  path: Array<Path>;
  id?: string;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  repeatButton: JSX.Element;
  oneToTwoColumn: boolean;

  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  helpElementIsVisible: boolean;
}

class Decimal extends React.Component<Props & ValidationProps, {}> {
  getValue(): string | number | undefined {
    const { item, answer } = this.props;
    if (answer && answer.valueDecimal) {
      return Number(answer.valueDecimal);
    }
    if (!item || !item.initialDecimal) {
      return '';
    }
  }

  getPDFValue() {
    const value = this.getValue();
    if (!value) {
      let text = '';
      if (this.props.resources && this.props.resources.ikkeBesvart) {
        text = this.props.resources.ikkeBesvart;
      }
      return text;
    }
    return value;
  }

  getStepInputProp(stepExtension: Extension): string {
    const step: number = Number(stepExtension.valueInteger);
    if (step === 0) {
      return '1';
    }
    let stepAsString = '';
    for (let i = 1; i < step; i++) {
      stepAsString += '0';
    }
    return `0.${stepAsString}1`;
  }

  getPattern() {
    const step = getExtension(ExtensionConstants.STEP_URL, this.props.item);
    if (step && step.valueInteger) {
      let stepString = '';
      const value = Number(step.valueInteger);
      if (value > 1) {
        stepString = `1,${value}`;
      } else if (value === 1) {
        stepString = '1';
      }
      return `^[+-]?[0-9]+(.[0-9]{${stepString}})?$`;
    }
  }

  inputProps() {
    const props: DecimalInputFieldProps = {};
    const step = getExtension(ExtensionConstants.STEP_URL, this.props.item);
    if (step && step.valueInteger) {
      props.step = this.getStepInputProp(step);
    }
    return props;
  }

  handleChange = (event: React.FormEvent<{}>) => {
    const { dispatch, path, item, promptLoginMessage } = this.props;
    const value = parseFloat((event.target as HTMLInputElement).value);
    if (dispatch) {
      dispatch(newDecimalValue(path, value, item));
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  render(): JSX.Element | null {
    const { item, pdf } = this.props;
    const value = this.getValue();
    if (pdf || isReadOnly(item)) {
      return <TextView item={item} value={this.getPDFValue()} children={this.props.children} />;
    }
    return (
      <div className="page_skjemautfyller__component page_skjemautfyller__component_decimal">
        <Validation {...this.props}>
          <SafeInputField
            type="number"
            id={getId(this.props.id)}
            inputName={getId(this.props.id)}
            value={value ? value + '' : ''}
            showLabel={true}
            label={
              <span
                dangerouslySetInnerHTML={{
                  __html: `${renderPrefix(item)} ${getText(item)}`,
                }}
              />
            }
            isRequired={isRequired(item)}
            placeholder={getPlaceholder(item)}
            inputProps={this.inputProps()}
            max={getMaxValueExtensionValue(item)}
            min={getMinValueExtensionValue(item)}
            onBlur={this.handleChange}
            errorMessage={getValidationTextExtension(item)}
            pattern={this.getPattern()}
            className="page_skjemautfyller__input"
            helpButton={this.props.renderHelpButton()}
            helpElement={this.props.renderHelpElement()}
            isHelpVisible={this.props.helpElementIsVisible}
          >
            {!this.props.oneToTwoColumn ? this.props.renderDeleteButton() : null}
          </SafeInputField>
        </Validation>
        {this.props.oneToTwoColumn ? (
          <div>
            {this.props.renderDeleteButton('page_skjemautfyller__deletebutton--margin-top')}
            {this.props.repeatButton}
          </div>
        ) : (
          <div>{this.props.repeatButton}</div>
        )}
        {this.props.children}
      </div>
    );
  }
}

const withCommonFunctionsComponent = withCommonFunctions(Decimal);
const connectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(layoutChange(withCommonFunctionsComponent));
export default connectedComponent;
