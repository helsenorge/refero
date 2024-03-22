import * as React from 'react';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem, Questionnaire } from 'fhir/r4';
import { useFormContext } from 'react-hook-form';
import { connect, useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { Resources } from '../../../types/resources';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';

import { debounce } from '@helsenorge/core-utils/debounce';
import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import { NewValueAction, newStringValueAsync } from '../../../store/actions/newValue';
import { GlobalState } from '../../../store/reducers';
import { getPlaceholder } from '../../../util/extension';
import {
  isReadOnly,
  isRequired,
  getId,
  getStringValue,
  getPDFStringValue,
  getSublabelText,
  renderPrefix,
  getText,
} from '../../../util/index';
import { mapStateToProps } from '../../../util/map-props';
import { Path, createFromIdFromPath } from '../../../util/refero-core';
import withCommonFunctions, { WithFormComponentsProps } from '../../with-common-functions';
// import SubLabel from '../sublabel';
import TextView from '../textview';

export interface StringProps extends WithFormComponentsProps {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  responseItem: QuestionnaireResponseItem;
  answer: QuestionnaireResponseItemAnswer;
  path: Array<Path>;
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
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  children: React.ReactNode;
}

const String = ({
  id,
  item,
  questionnaire,
  pdf,
  resources,
  answer,
  onRenderMarkdown,
  promptLoginMessage,
  path,
  onAnswerChange,
  renderHelpElement,
  renderHelpButton,
  children,
  renderDeleteButton,
  repeatButton,
}: StringProps): JSX.Element => {
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

  if (pdf || isReadOnly(item)) {
    return (
      <TextView
        id={id}
        item={item}
        value={getPDFStringValue(answer, resources)}
        onRenderMarkdown={onRenderMarkdown}
        textClass="page_refero__component_readonlytext"
        helpButton={renderHelpButton()}
        helpElement={renderHelpElement()}
      >
        {children}
      </TextView>
    );
  }

  const inputId = getId(id);
  const labelText = `${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire, resources)}`;
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);

  const handleInputChange = (event: React.FormEvent<HTMLInputElement>): void => {
    event.persist();
    debouncedHandleChange(event);
  };

  const formId = createFromIdFromPath(path);
  const { getFieldState, register } = useFormContext();
  const { error } = getFieldState(formId);
  return (
    <div className="page_refero__component page_refero__component_string">
      {renderHelpElement()}
      <FormGroup error={error?.message} mode="ongrey">
        <Input
          {...register(formId, {
            onChange: handleInputChange,
          })}
          label={
            <Label
              labelTexts={[{ text: labelText, type: 'semibold' }]}
              sublabel={
                <Sublabel id={`${formId}_sublabel`} sublabelTexts={[{ text: subLabelText, hideFromScreenReader: false, type: 'normal' }]} />
              }
              afterLabelChildren={renderHelpButton()}
            />
          }
          type="text"
          width={25}
          inputId={inputId}
          defaultValue={getStringValue(answer)}
          placeholder={getPlaceholder(item)}
          className="page_refero__input"
        />
        {renderDeleteButton('page_refero__deletebutton--margin-top')}
        {repeatButton}
      </FormGroup>
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
    </div>
  );
};
const withCommonFunctionsComponent = withCommonFunctions(String);
const connectedComponent = connect(mapStateToProps)(layoutChange(withCommonFunctionsComponent));
export default connectedComponent;
