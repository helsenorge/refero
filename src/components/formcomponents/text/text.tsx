import * as React from 'react';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem } from 'fhir/r4';
import { useFormContext } from 'react-hook-form';
import { connect, useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { Resources } from '../../../types/resources';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';
import Textarea from '@helsenorge/designsystem-react/components/Textarea';

import { debounce } from '@helsenorge/core-utils/debounce';

import { HighlightComponent } from './HighlightComponent';
import { InlineComponent } from './InlineComponent';
import Constants from '../../../constants/index';
import itemControlConstants from '../../../constants/itemcontrol';
import { NewValueAction, newStringValueAsync } from '../../../store/actions/newValue';
import { GlobalState } from '../../../store/reducers';
import { getPlaceholder, getItemControlExtensionValue } from '../../../util/extension';
import {
  isReadOnly,
  getId,
  renderPrefix,
  getText,
  getMaxLength,
  getPDFStringValue,
  getTextValidationErrorMessage,
  getSublabelText,
  getStringValue,
} from '../../../util/index';
import { mapStateToProps } from '../../../util/map-props';
import { Path, createFromIdFromPath } from '../../../util/refero-core';
import { SanitizeText } from '../../../util/sanitize/domPurifyHelper';
import withCommonFunctions, { EnhancedWithCommonFunctionProps } from '../../with-common-functions';
import TextView from '../textview';

export interface TextProps extends EnhancedWithCommonFunctionProps {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  responseItem: QuestionnaireResponseItem;
  answer: QuestionnaireResponseItemAnswer;
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
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  shouldExpanderRenderChildrenWhenClosed?: boolean;
  children: React.ReactNode;
}
const Text = ({
  id,
  item,
  answer,
  pdf,
  children,
  resources,
  onRenderMarkdown,
  questionnaire,
  promptLoginMessage,
  path,
  onAnswerChange,
  shouldExpanderRenderChildrenWhenClosed,
  renderHelpButton,
  renderHelpElement,
  repeatButton,
  renderDeleteButton,
}: TextProps): JSX.Element | null => {
  // const showCounter = (): boolean => {
  //   if (getMaxLength(item) || getMinLengthExtensionValue(item)) {
  //     return true;
  //   }
  //   return false;
  // };
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const handleChange = (event: React.FormEvent): void => {
    const value = (event.target as HTMLInputElement).value;
    if (dispatch) {
      dispatch(newStringValueAsync(path, value, item))?.then(newState =>
        onAnswerChange(newState, path, item, { valueString: value } as QuestionnaireResponseItemAnswer)
      );
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  const debouncedHandleChange: (event: React.FormEvent) => void = debounce(handleChange, 250, false);

  const itemControls = getItemControlExtensionValue(item);
  const textAreaId = getId(id);

  if (itemControls && itemControls.some(itemControl => itemControl.code === itemControlConstants.SIDEBAR)) {
    return null;
  }

  if (itemControls && itemControls.some(itemControl => itemControl.code === itemControlConstants.INLINE)) {
    return (
      <InlineComponent renderChildrenWhenClosed={shouldExpanderRenderChildrenWhenClosed ? true : false} title={item.text ? item.text : ''}>
        {children}
      </InlineComponent>
    );
  }

  if (itemControls && itemControls.some(itemControl => itemControl.code === itemControlConstants.HIGHLIGHT)) {
    return <HighlightComponent id={id} text={getText(item, onRenderMarkdown, questionnaire, resources)} />;
  }

  if (pdf || isReadOnly(item)) {
    return (
      <TextView
        id={id}
        item={item}
        value={getPDFStringValue(answer)}
        onRenderMarkdown={onRenderMarkdown}
        textClass="page_refero__component_readonlytext"
        helpButton={renderHelpButton()}
        helpElement={renderHelpElement()}
      >
        {children}
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
  // validateOnExternalUpdate={true}
  // stringOverMaxLengthError={resources?.stringOverMaxLengthError}
  const onTextAreaChange = (event: React.FormEvent<HTMLTextAreaElement>): void => {
    event.persist();
    debouncedHandleChange(event);
  };
  const formId = createFromIdFromPath(path);
  const { getFieldState, register } = useFormContext();
  const { error } = getFieldState(formId);
  return (
    <div className="page_refero__component page_refero__component_text">
      <FormGroup error={error?.message} mode="ongrey">
        {renderHelpElement()}
        <Textarea
          {...register(formId, { onChange: onTextAreaChange, value: getStringValue(answer) })}
          textareaId={textAreaId}
          maxRows={Constants.DEFAULT_TEXTAREA_HEIGHT}
          placeholder={getPlaceholder(item)}
          label={
            <Label
              labelTexts={[{ text: labelText, type: 'semibold' }]}
              sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
              afterLabelChildren={renderHelpButton()}
            />
          }
          defaultValue={getStringValue(answer)}
          grow={true}
          maxCharacters={getMaxLength(item)}
          maxText={getMaxLength(item) ? resources?.maxLengthText?.replace('{0}', `${getMaxLength(item)}`) : ''}
        />
        {renderDeleteButton('page_refero__deletebutton--margin-top')}
        {repeatButton}
      </FormGroup>

      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
    </div>
  );
};

const withCommonFunctionsComponent = withCommonFunctions(Text);
const connectedComponent = connect(mapStateToProps)(withCommonFunctionsComponent);
export default connectedComponent;
