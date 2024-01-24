import * as React from 'react';

import { useForm } from 'react-hook-form';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem, Questionnaire } from '../../../types/fhir';
import { ValidationProps } from '../../../types/formTypes/validation';

import Input from '@helsenorge/designsystem-react/components/Input';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';
import Validation from '@helsenorge/designsystem-react/components/Validation';

import { debounce } from '@helsenorge/core-utils/debounce';
import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

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
import { Path } from '../../../util/refero-core';
import { Resources } from '../../../util/resources';
import withCommonFunctions, { WithCommonFunctionsProps } from '../../with-common-functions';
import TextView from '../textview';

export interface StringProps extends WithCommonFunctionsProps {
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

const String: React.FC<StringProps & ValidationProps> = props => {
  const [inputValue, setInputValue] = React.useState('');

  const handleChange = (event: React.FormEvent<{}>): void => {
    const { dispatch, promptLoginMessage, path, item, onAnswerChange } = props;
    const value = (event.target as HTMLInputElement).value;
    if (dispatch) {
      dispatch(newStringValueAsync(props.path, value, props.item))?.then(newState =>
        onAnswerChange(newState, path, item, { valueString: value } as QuestionnaireResponseItemAnswer)
      );
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  const debouncedHandleChange: (event: React.FormEvent<{}>) => void = debounce(handleChange, 250, false);

  React.useMemo(() => {
    const responseItemHasChanged = props.responseItem !== props.responseItem;
    const helpItemHasChanged = props.isHelpOpen !== props.isHelpOpen;
    const answerHasChanged = props.answer !== props.answer;
    const resourcesHasChanged = JSON.stringify(props.resources) !== JSON.stringify(props.resources);
    const repeats = props.item.repeats ?? false;

    return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || repeats || answerHasChanged;
  }, [props.responseItem, props.isHelpOpen, props.answer, props.resources, props.item]);

  const validateText2 = (value: string): boolean => {
    return validateText(value, props.validateScriptInjection);
  };

  const getValidationErrorMessage = (value: string): string => {
    return getTextValidationErrorMessage(value, props.validateScriptInjection, props.item, props.resources);
  };

  const getRequiredErrorMessage = (item: QuestionnaireItem): string | undefined => {
    return isRequired(item) ? props.resources?.formRequiredErrorMessage : undefined;
  };

  const { register } = useForm();
  const { id, item, questionnaire, pdf, resources, answer, onRenderMarkdown } = props;
  if (pdf || isReadOnly(item)) {
    return (
      <TextView
        id={id}
        item={item}
        value={getPDFStringValue(answer, resources)}
        onRenderMarkdown={onRenderMarkdown}
        textClass="page_refero__component_readonlytext"
        helpButton={props.renderHelpButton()}
        helpElement={props.renderHelpElement()}
      >
        {props.children}
      </TextView>
    );
  }

  const inputId = getId(props.id);
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
      <Validation errorSummary={false ? 'Sjekk at alt er riktig utfylt' : undefined}>
        <>
          <Label
            htmlFor={inputId}
            labelTexts={[{ text: labelText, type: 'semibold' }]}
            sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
            afterLabelChildren={props.renderHelpButton()}
          />
          {props.renderHelpElement()}
          <Input
            {...register(getId(props.id))}
            type="text"
            width={25}
            inputId={inputId}
            name={getId(props.id)}
            defaultValue={getStringValue(answer)}
            required={isRequired(item)}
            placeholder={getPlaceholder(item)}
            min={getMinLengthExtensionValue(item)}
            max={getMaxLength(item)}
            onChange={(event: React.FormEvent<HTMLInputElement>): void => {
              event.persist();
              debouncedHandleChange(event);
              setInputValue(event.currentTarget.value);
            }}
            className="page_refero__input"
            errorText={getValidationErrorMessage(inputValue)}
          />
        </>
      </Validation>
      {props.renderDeleteButton('page_refero__deletebutton--margin-top')}
      {props.repeatButton}
      {props.children ? <div className="nested-fieldset nested-fieldset--full-height">{props.children}</div> : null}
    </div>
  );
};
const withCommonFunctionsComponent = withCommonFunctions(String);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(layoutChange(withCommonFunctionsComponent));
export default connectedComponent;
