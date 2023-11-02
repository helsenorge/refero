import * as React from 'react';

import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem, Questionnaire } from '../../../types/fhir';
import { ValidationProps } from '../../../types/formTypes/validation';

import { debounce } from '@helsenorge/core-utils/debounce';
import layoutChange from '@helsenorge/core-utils/hoc/layout-change';
import Validation from '@helsenorge/designsystem-react/components/Validation';
import Input from '@helsenorge/designsystem-react/components/Input';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';

import { NewValueAction, newStringValueAsync } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import { getPlaceholder, getMinLengthExtensionValue } from '../../../util/extension';
import {
  isReadOnly,
  isRequired,
  getId,
  getStringValue,
  getMaxLength,
  getPDFStringValue,
  validateText,
  getTextValidationErrorMessage,
  getSublabelText,
  renderPrefix,
  getText,
} from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Resources } from '../../../util/resources';
import { Path } from '../../../util/refero-core';
import withCommonFunctions from '../../with-common-functions';
import TextView from '../textview';
import { useForm } from 'react-hook-form';

export interface Props {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  responseItem: QuestionnaireResponseItem;
  answer: QuestionnaireResponseItemAnswer;
  path: Array<Path>;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  id?: string;
  resources?: Resources;
  visibleDeleteButton: boolean;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  repeatButton: JSX.Element;
  oneToTwoColumn: boolean;
  validateScriptInjection: boolean;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  isHelpOpen?: boolean;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

export class String extends React.Component<Props & ValidationProps, {}> {
  state = {
    inputValue: '',
  };

  setInputValue = (value: string) => {
    this.setState({
      inputValue: value,
    });
  };

  handleChange = (event: React.FormEvent<{}>): void => {
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

  debouncedHandleChange: (event: React.FormEvent<{}>) => void = debounce(this.handleChange, 250, false);

  shouldComponentUpdate(nextProps: Props): boolean {
    const responseItemHasChanged = this.props.responseItem !== nextProps.responseItem;
    const helpItemHasChanged = this.props.isHelpOpen !== nextProps.isHelpOpen;
    const answerHasChanged = this.props.answer !== nextProps.answer;
    const resourcesHasChanged = JSON.stringify(this.props.resources) !== JSON.stringify(nextProps.resources);
    const repeats = this.props.item.repeats ?? false;

    return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || repeats || answerHasChanged;
  }

  validateText = (value: string): boolean => {
    return validateText(value, this.props.validateScriptInjection);
  };

  getValidationErrorMessage = (value: string): string => {
    return getTextValidationErrorMessage(value, this.props.validateScriptInjection, this.props.item, this.props.resources);
  };

  getRequiredErrorMessage = (item: QuestionnaireItem): string | undefined => {
    return isRequired(item) ? this.props.resources?.formRequiredErrorMessage : undefined;
  };

  render(): JSX.Element | null {
    const { register } = useForm();
    const { id, item, questionnaire, pdf, resources, answer, onRenderMarkdown } = this.props;
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

    // onChangeValidator={this.validateText}
    // showLabel={true}
    // pattern={getRegexExtension(item)}
    // requiredErrorMessage={this.getRequiredErrorMessage(item)}
    // validateOnExternalUpdate={true}
    // stringOverMaxLengthError={resources?.stringOverMaxLengthError}

    return (
      <div className="page_refero__component page_refero__component_string">
        <Validation {...this.props}>
          <Input
            {...register("string_formComponent")}
            type="text"
            inputId={getId(this.props.id)}
            name={getId(this.props.id)}
            defaultValue={getStringValue(answer)}
            label={
              <Label
                labelTexts={[{ text: labelText, type: 'semibold' }]}
                sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
                afterLabelChildren={
                  <>
                    {this.props.renderHelpButton()}
                  </>
                }
              />
            }
            required={isRequired(item)}
            placeholder={getPlaceholder(item)}
            min={getMinLengthExtensionValue(item)}
            max={getMaxLength(item)}
            onChange={(event: React.FormEvent<HTMLInputElement>): void => {
              event.persist();
              this.debouncedHandleChange(event);
              this.setInputValue(event.currentTarget.value);
            }}
            className="page_refero__input"
            errorText={this.getValidationErrorMessage(this.state.inputValue)}
          />
        </Validation>
        {this.props.renderDeleteButton('page_refero__deletebutton--margin-top')}
        {this.props.repeatButton}
        {this.props.children ? <div className="nested-fieldset nested-fieldset--full-height">{this.props.children}</div> : null}
        {this.props.renderHelpElement()}
      </div>
    );
  }
}
const withCommonFunctionsComponent = withCommonFunctions(String);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(layoutChange(withCommonFunctionsComponent));
export default connectedComponent;
