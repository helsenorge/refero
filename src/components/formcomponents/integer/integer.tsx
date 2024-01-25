import * as React from 'react';

import { useForm } from 'react-hook-form';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { QuestionnaireItem, QuestionnaireResponseItemAnswer, QuestionnaireResponseItem, Questionnaire } from '../../../types/fhir';
import { ValidationProps } from '../../../types/formTypes/validation';

import Input from '@helsenorge/designsystem-react/components/Input';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';
import Validation from '@helsenorge/designsystem-react/components/Validation';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import { NewValueAction, newIntegerValueAsync } from '../../../actions/newValue';
import { GlobalState } from '../../../reducers';
import { getValidationTextExtension, getPlaceholder, getMaxValueExtensionValue, getMinValueExtensionValue } from '../../../util/extension';
import { isReadOnly, isRequired, getId, getSublabelText, renderPrefix, getText } from '../../../util/index';
import { mapStateToProps, mergeProps, mapDispatchToProps } from '../../../util/map-props';
import { Path } from '../../../util/refero-core';
import { Resources } from '../../../util/resources';
import withCommonFunctions, { WithCommonFunctionsProps } from '../../with-common-functions';
import TextView from '../textview';

export interface IntegerProps extends WithCommonFunctionsProps {
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

const Integer: React.FC<IntegerProps & ValidationProps> = props => {
  const getValue = (): string | number | number[] | undefined => {
    const { item, answer } = props;
    if (answer && Array.isArray(answer)) {
      return answer.map(m => m.valueInteger);
    }
    if (answer && answer.valueInteger !== undefined && answer.valueInteger !== null) {
      return answer.valueInteger;
    }
    if (!item || !item.initial || item.initial.length === 0 || !item.initial[0].valueInteger) {
      return '';
    }
  };

  const getPDFValue = (): string | number => {
    const value = getValue();
    if (value === undefined || value === null || value === '') {
      let text = '';
      if (props.resources && props.resources.ikkeBesvart) {
        text = props.resources.ikkeBesvart;
      }
      return text;
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return value;
  };

  const handleChange = (event: React.FormEvent): void => {
    const { dispatch, promptLoginMessage, path, item, onAnswerChange } = props;
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    if (dispatch) {
      dispatch(newIntegerValueAsync(props.path, value, props.item))?.then(newState =>
        onAnswerChange(newState, path, item, { valueInteger: value } as QuestionnaireResponseItemAnswer)
      );
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  // React.useMemo(() => {
  //   const responseItemHasChanged = props.responseItem !== props.responseItem;
  //   const helpItemHasChanged = props.isHelpOpen !== props.isHelpOpen;
  //   const answerHasChanged = props.answer !== props.answer;
  //   const resourcesHasChanged = JSON.stringify(props.resources) !== JSON.stringify(props.resources);
  //   const repeats = props.item.repeats ?? false;

  //   return responseItemHasChanged || helpItemHasChanged || resourcesHasChanged || repeats || answerHasChanged;
  // }, [props.responseItem, props.isHelpOpen, props.answer, props.resources, props.item]);

  const { register } = useForm();

  const inputId = getId(props.id);

  if (props.pdf || isReadOnly(props.item)) {
    return (
      <TextView
        id={props.id}
        item={props.item}
        value={getPDFValue()}
        onRenderMarkdown={props.onRenderMarkdown}
        helpButton={props.renderHelpButton()}
        helpElement={props.renderHelpElement()}
      >
        {props.children}
      </TextView>
    );
  }

  const value = getValue();
  const labelText = `${renderPrefix(props.item)} ${getText(props.item, props.onRenderMarkdown, props.questionnaire, props.resources)}`;
  const subLabelText = getSublabelText(props.item, props.onRenderMarkdown, props.questionnaire, props.resources);

  // showLabel={true}
  // validateOnExternalUpdate={true}

  return (
    <div className="page_refero__component page_refero__component_integer">
      <Validation {...props}>
        <>
          <Label
            htmlFor={inputId}
            labelTexts={[{ text: labelText, type: 'semibold' }]}
            sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
            afterLabelChildren={props.renderHelpButton()}
          />
          {props.renderHelpElement()}
          <Input
            {...register('textField_openChoice')}
            type="number"
            inputId={inputId}
            name={getId(props.id)}
            defaultValue={value !== undefined && value !== null ? value + '' : ''}
            required={isRequired(props.item)}
            placeholder={getPlaceholder(props.item)}
            max={getMaxValueExtensionValue(props.item)}
            min={getMinValueExtensionValue(props.item)}
            errorText={getValidationTextExtension(props.item)}
            className="page_refero__input"
            width={25}
            onChange={handleChange}
          />
        </>
      </Validation>
      {props.renderDeleteButton('page_refero__deletebutton--margin-top')}
      {props.repeatButton}
      {props.children ? <div className="nested-fieldset nested-fieldset--full-height">{props.children}</div> : null}
    </div>
  );
};

const withCommonFunctionsComponent = withCommonFunctions(Integer);
const connectedComponent = connect(mapStateToProps, mapDispatchToProps, mergeProps)(layoutChange(withCommonFunctionsComponent));
export default connectedComponent;
