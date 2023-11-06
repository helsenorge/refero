import * as React from 'react';

import DOMPurify from 'dompurify';

import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem } from '../../../types/fhir';
import { ValidationProps } from '../../../types/formTypes/validation';

import Expander from '@helsenorge/designsystem-react/components/Expander';

import { debounce } from '@helsenorge/core-utils/debounce';
import Validation from '@helsenorge/designsystem-react/components/Validation';
import Textarea from '@helsenorge/designsystem-react/components/Textarea';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';

import { NewValueAction, newStringValueAsync } from '../../../actions/newValue';
import Constants from '../../../constants/index';
import itemControlConstants from '../../../constants/itemcontrol';
import { GlobalState } from '../../../reducers';
import { getPlaceholder, getMinLengthExtensionValue, getItemControlExtensionValue, getRegexExtension } from '../../../util/extension';
import {
  isReadOnly,
  isRequired,
  getId,
  renderPrefix,
  getText,
  getMaxLength,
  getPDFStringValue,
  validateText,
  getTextValidationErrorMessage,
  getSublabelText,
} from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import { Resources } from '../../../util/resources';
import withCommonFunctions, { WithCommonFunctionsProps } from '../../with-common-functions';
import TextView from '../textview';
import { SanitizeText } from '../../../util/sanitize/domPurifyHelper';
import { useForm } from 'react-hook-form';

export interface TextProps extends WithCommonFunctionsProps {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  responseItem: QuestionnaireResponseItem;
  answer: QuestionnaireResponseItemAnswer;
  dispatch?: ThunkDispatch<GlobalState, void, NewValueAction>;
  path: Array<Path>;
  pdf?: boolean;
  promptLoginMessage?: () => void;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  id?: string;
  repeatButton: JSX.Element;
  validateScriptInjection: boolean;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  resources?: Resources;
  onAnswerChange: (newState: GlobalState, path: Array<Path>, item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  isHelpOpen?: boolean;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  shouldExpanderRenderChildrenWhenClosed?: boolean;
}
const Text: React.FC<TextProps & ValidationProps> = props => {
  const [inputValue, setInputValue] = React.useState('');

  // const showCounter = (): boolean => {
  //   if (getMaxLength(props.item) || getMinLengthExtensionValue(props.item)) {
  //     return true;
  //   }
  //   return false;
  // };

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

  const validateText2 = (value: string): boolean => {
    return validateWithRegex(value) && validateText(value, props.validateScriptInjection);
  };

  const validateWithRegex = (value: string): boolean => {
    const regexAsStr = getRegexExtension(props.item);
    if (regexAsStr && value) {
      const regexp = new RegExp(regexAsStr);
      if (!regexp.test(value.toString())) {
        return false;
      }
    }

    return true;
  };

  const getValidationErrorMessage = (value: string): string => {
    return getTextValidationErrorMessage(value, props.validateScriptInjection, props.item, props.resources);
  };

  const getRequiredErrorMessage = (item: QuestionnaireItem): string | undefined => {
    return isRequired(item) ? props.resources?.formRequiredErrorMessage : undefined;
  };

  React.useMemo(() => {
    const responseItemHasChanged = props.responseItem !== props.responseItem;
    const helpItemHasChanged = props.isHelpOpen !== props.isHelpOpen;
    const answerHasChanged = props.answer !== props.answer;
    const resourcesHasChanged = JSON.stringify(props.resources) !== JSON.stringify(props.resources);
    const repeats = props.item.repeats ?? false;

    return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || repeats || answerHasChanged;
  }, [props.responseItem, props.isHelpOpen, props.answer, props.resources, props.item]);

  const { register } = useForm();
  const { id, item, answer, pdf, children, resources, onRenderMarkdown, questionnaire, ...other } = props;
  const itemControls = getItemControlExtensionValue(item);

  if (itemControls && itemControls.some(itemControl => itemControl.code === itemControlConstants.SIDEBAR)) {
    return null;
  }

  if (itemControls && itemControls.some(itemControl => itemControl.code === itemControlConstants.INLINE)) {
    return (
      <div id={id} className="page_refero__component page_refero__component_expandabletext">
        <Expander title={item.text ? item.text : ''} renderChildrenWhenClosed={props.shouldExpanderRenderChildrenWhenClosed ? true : false}>
          <React.Fragment>{children}</React.Fragment>
        </Expander>
      </div>
    );
  }

  if (itemControls && itemControls.some(itemControl => itemControl.code === itemControlConstants.HIGHLIGHT)) {
    return (
      <div
        id={id}
        className="page_refero__component page_refero__component_highlight"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(`${getText(item, onRenderMarkdown, questionnaire, resources)}`, {
            RETURN_TRUSTED_TYPE: true,
            ADD_ATTR: ['target'],
          }) as unknown as string,
        }}
      />
    );
  }

  if (pdf || isReadOnly(item)) {
    return (
      <TextView
        id={id}
        item={item}
        value={getPDFStringValue(answer)}
        onRenderMarkdown={onRenderMarkdown}
        textClass="page_refero__component_readonlytext"
        helpButton={props.renderHelpButton()}
        helpElement={props.renderHelpElement()}
      >
        {props.children}
      </TextView>
    );
  }
  const labelText = SanitizeText(`${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire, resources)}`) || '';
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);

  // BYTTA ROWS TIL MAXROWS
  // value={getStringValue(answer)}
  // showLabel={true}
  // max={getMaxLength(item)}
  // min={getMinLengthExtensionValue(item)}
  // counter={this.showCounter()}
  // validator={this.validateText}
  // errorText={this.getValidationErrorMessage}
  // requiredErrorMessage={this.getRequiredErrorMessage(item)}
  // validateOnExternalUpdate={true}
  // stringOverMaxLengthError={resources?.stringOverMaxLengthError}

  return (
    <div className="page_refero__component page_refero__component_text">
      <Validation {...other}>
        <Textarea
          {...register('text')}
          textareaId={getId(props.id)}
          maxRows={Constants.DEFAULT_TEXTAREA_HEIGHT}
          required={isRequired(item)}
          label={
            <Label
              labelTexts={[{ text: labelText, type: 'semibold' }]}
              sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
              afterLabelChildren={<>{props.renderHelpButton()}</>}
            />
          }
          placeholder={getPlaceholder(item)}
          onChange={(event: React.FormEvent<HTMLTextAreaElement>): void => {
            event.persist();
            debouncedHandleChange(event);
            setInputValue(event.currentTarget.value);
          }}
          maxCharacters={getMaxLength(item)}
          maxText={'tegn'}
          errorText={getValidationErrorMessage(inputValue)}
        />
      </Validation>
      {props.renderDeleteButton('page_refero__deletebutton--margin-top')}
      {props.repeatButton}
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
      {props.renderHelpElement()}
    </div>
  );
};

const withCommonFunctionsComponent = withCommonFunctions(Text);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(withCommonFunctionsComponent);
export default connectedComponent;
