import * as React from 'react';

import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem, Questionnaire } from '../../../types/fhir';
import { ValidationProps } from '../../../types/form types/validation';

import { debounce } from '@helsenorge/core-utils/debounce';
import layoutChange from '@helsenorge/core-utils/hoc/layout-change';
import Validation from '@helsenorge/designsystem-react/components/Validation';
import Input from '@helsenorge/designsystem-react/components/Input';

import { NewValueAction, newStringValueAsync } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import { getPlaceholder, getMinLengthExtensionValue, getRegexExtension } from '../../../util/extension';
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
} from '../../../util/index';
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
    // const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);

    //onChangeValidator={this.validateText}
    //showLabel={true}
    //subLabel={subLabelText ? <SubLabel subLabelText={subLabelText} /> : undefined}
    //pattern={getRegexExtension(item)}
    //requiredErrorMessage={this.getRequiredErrorMessage(item)}
    //helpButton={this.props.renderHelpButton()}
    //helpElement={this.props.renderHelpElement()}
    //validateOnExternalUpdate={true}
    //stringOverMaxLengthError={resources?.stringOverMaxLengthError}
    //errorText={this.getValidationErrorMessage()}
    

    return (
      <div className="page_refero__component page_refero__component_string">
        <Validation {...this.props}>
          <Input
            type="text"
            inputId={getId(this.props.id)}
            name={getId(this.props.id)}
            value={getStringValue(answer)}
            label={<Label item={item} onRenderMarkdown={onRenderMarkdown} questionnaire={questionnaire} resources={resources} />}
            required={isRequired(item)}
            placeholder={getPlaceholder(item)}
            min={getMinLengthExtensionValue(item)}
            max={getMaxLength(item)}
            onChange={(event: React.FormEvent<{}>): void => {
              event.persist();
              this.debouncedHandleChange(event);
            }}
            className="page_refero__input"
          />
        </Validation>
        {this.props.renderDeleteButton('page_refero__deletebutton--margin-top')}
        {this.props.repeatButton}
        {this.props.children ? <div className="nested-fieldset nested-fieldset--full-height">{this.props.children}</div> : null}
      </div>
    );
  }
}
const withCommonFunctionsComponent = withCommonFunctions(String);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(layoutChange(withCommonFunctionsComponent));
export default connectedComponent;
