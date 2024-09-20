import React, { useState } from 'react';

import { FieldValues, useFormContext } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import styles from '../common-styles.module.css';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';

import { NewValueAction, newStringValueAsync } from '@/actions/newValue';
import { GlobalState } from '@/reducers';
import { getPlaceholder } from '@/util/extension';
import { isReadOnly, getId, getStringValue, getPDFStringValue } from '@/util/index';
import TextView from '../textview';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { useIsEnabled } from '@/hooks/useIsEnabled';
import RenderHelpButton from '@/components/formcomponents/help-button/RenderHelpButton';
import RenderHelpElement from '@/components/formcomponents/help-button/RenderHelpElement';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { maxLength, minLength, regexpPattern, required, scriptInjection } from '@/components/validation/rules';

export type Props = QuestionnaireComponentItemProps;

export const String = (props: Props): JSX.Element | null => {
  const { path, item, id, pdf, resources, idWithLinkIdAndItemIndex, children, responseItems, index, responseItem } = props;
  const { promptLoginMessage, validateScriptInjection, onAnswerChange } = useExternalRenderContext();
  const { formState, getFieldState, register } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex, formState);
  const { error } = fieldState;
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const answer = useGetAnswer(responseItem, item);
  const enable = useIsEnabled(item, path);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    if (dispatch && path) {
      dispatch(newStringValueAsync(path, value, item))?.then(newState => {
        return onAnswerChange(newState, item, { valueString: value });
      });
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  if (!enable) {
    return null;
  }
  if (pdf || isReadOnly(item)) {
    return (
      <TextView id={id} item={item} value={getPDFStringValue(answer, resources)} textClass="page_refero__component_readonlytext">
        {children}
      </TextView>
    );
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    handleChange(event);
  };
  const value = getStringValue(answer);
  const { onChange, ...rest } = register(idWithLinkIdAndItemIndex, {
    required: required({ item, resources }),
    minLength: minLength({ item, resources }),
    maxLength: maxLength({ item, resources }),
    pattern: regexpPattern({ item, resources }),
    validate: (value: string): string | true | undefined =>
      scriptInjection({ value, resources, shouldValidate: !!validateScriptInjection }),
    shouldUnregister: true,
  });
  return (
    <div className="page_refero__component page_refero__component_string">
      <FormGroup error={error?.message ?? ''} mode="ongrey" errorWrapperClassName={styles.paddingBottom}>
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={getId(id)}
          labelId={`${getId(id)}-string-label`}
          testId={`${getId(id)}-string-label`}
          afterLabelContent={<RenderHelpButton item={item} setIsHelpVisible={setIsHelpVisible} isHelpVisible={isHelpVisible} />}
        />
        <RenderHelpElement item={item} isHelpVisible={isHelpVisible} />
        <Input
          {...rest}
          value={value}
          disabled={item.readOnly}
          onChange={(e): void => {
            handleInputChange(e);
            onChange(e);
          }}
          type="text"
          width={25}
          testId={`${getId(id)}-string`}
          inputId={getId(id)}
          placeholder={getPlaceholder(item)}
          className="page_refero__input"
        />
        <RenderDeleteButton
          item={item}
          path={path}
          index={index}
          responseItem={responseItem}
          className="page_refero__deletebutton--margin-top"
        />
        <RenderRepeatButton path={path?.slice(0, -1)} item={item} index={index} responseItem={responseItem} responseItems={responseItems} />
      </FormGroup>

      {children && <div className="nested-fieldset nested-fieldset--full-height">{children}</div>}
    </div>
  );
};
export default String;
