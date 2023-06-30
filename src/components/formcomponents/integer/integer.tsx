import * as React from 'react';

import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem, Questionnaire } from '../../../types/fhir';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';
import Validation from '@helsenorge/form/components/form/validation';
import { ValidationProps } from '@helsenorge/form/components/form/validation';
import SafeInputField from '@helsenorge/form/components/safe-input-field';

import { NewValueAction, newIntegerValueAsync } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import { getValidationTextExtension, getPlaceholder, getMaxValueExtensionValue, getMinValueExtensionValue } from '../../../util/extension';
import { isReadOnly, isRequired, getId, getSublabelText } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Resources } from '../../../util/resources';
import { Path } from '../../../util/refero-core';
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
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  id?: string;
  repeatButton: JSX.Element;
  oneToTwoColumn: boolean;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  isHelpOpen?: boolean;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

class Integer extends React.Component<Props & ValidationProps, {}> {
  getValue(): string | number | number[] | undefined {
    const { item, answer } = this.props;
    if (answer && Array.isArray(answer)) {
      return answer.map((m) => m.valueInteger);
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

  handleChange = (event: React.FormEvent<{}>): void => {
    const { dispatch, promptLoginMessage, path, item, onAnswerChange } = this.props;
    const value = parseInt((event.target as HTMLInputElement).value, 10);
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

    return (
      <div className="page_refero__component page_refero__component_integer">
        <Validation {...this.props}>
          <SafeInputField
            type="number"
            id={getId(this.props.id)}
            inputName={getId(this.props.id)}
            value={value !== undefined && value !== null ? value + '' : ''}
            showLabel={true}
            label={
              <Label
                item={this.props.item}
                onRenderMarkdown={this.props.onRenderMarkdown}
                questionnaire={this.props.questionnaire}
                resources={this.props.resources}
              />
            }
            subLabel={subLabelText ? <SubLabel subLabelText={subLabelText} /> : undefined}
            isRequired={isRequired(this.props.item)}
            placeholder={getPlaceholder(this.props.item)}
            max={getMaxValueExtensionValue(this.props.item)}
            min={getMinValueExtensionValue(this.props.item)}
            errorMessage={getValidationTextExtension(this.props.item)}
            inputProps={{
              step: '1',
              onKeyPress: (e: React.KeyboardEvent<{}>): void => {
                const key = String.fromCharCode(e.which);
                if ('0123456789-'.indexOf(key) === -1) {
                  e.preventDefault();
                }
              },
            }}
            className="page_refero__input"
            onChange={this.handleChange}
            helpButton={this.props.renderHelpButton()}
            helpElement={this.props.renderHelpElement()}
            validateOnExternalUpdate={true}
          />
        </Validation>
        {this.props.renderDeleteButton('page_refero__deletebutton--margin-top')}
        {this.props.repeatButton}
        {this.props.children ? <div className="nested-fieldset nested-fieldset--full-height">{this.props.children}</div> : null}
      </div>
    );
  }
}

const withCommonFunctionsComponent = withCommonFunctions(Integer);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(layoutChange(withCommonFunctionsComponent));
export default connectedComponent;
