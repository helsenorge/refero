import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { required, maxLength, minLength, regexpPattern, scriptInjection } from '@/components/validation/rules';
import { getPlaceholder } from '@/util/extension';
import { getId } from '@/util/index';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { findQuestionnaireItem } from '@/reducers/selectors';
import { GlobalState, useAppDispatch } from '@/reducers';
import { newStringValueAsync } from '@/actions/newValue';
import { QuestionnaireItem } from 'fhir/r4';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';

const MyCustomStringComponent: React.FC<QuestionnaireComponentItemProps> = props => {
  const { path, id, idWithLinkIdAndItemIndex, linkId, children } = props;
  const dispatch = useAppDispatch();
  const { register, getFieldState, formState } = useFormContext();
  const { resources, validateScriptInjection, promptLoginMessage } = useExternalRenderContext();
  const answer = useGetAnswer(linkId, path);
  const item = useSelector<GlobalState, QuestionnaireItem | undefined>(state => findQuestionnaireItem(state, linkId));

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    if (dispatch && path && item) {
      dispatch(newStringValueAsync(path, value, item));
      // Handle onAnswerChange if needed
    }
    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  const { onChange, ...rest } = register(idWithLinkIdAndItemIndex, {
    required: required({ item, resources }),
    minLength: minLength({ item, resources }),
    maxLength: maxLength({ item, resources }),
    pattern: regexpPattern({ item, resources }),
    validate: (value: string): string | true | undefined =>
      scriptInjection({ value, resources, shouldValidate: !!validateScriptInjection }),
    shouldUnregister: true,
  });

  const error = getFieldState(idWithLinkIdAndItemIndex, formState).error;
  const defaultValue = Array.isArray(answer) ? answer[0]?.valueString : answer?.valueString;
  return (
    <div className="page_refero__component page_refero__component_string">
      <label htmlFor={getId(id)}>{item?.text}</label>
      {'CUSTOM STRING VALUE'}
      <input
        {...rest}
        id={getId(id)}
        defaultValue={defaultValue}
        onChange={e => {
          handleChange(e);
          onChange(e);
        }}
        placeholder={getPlaceholder(item)}
      />
      {error && <span>{error.message}</span>}
      {/* Render help button, repeat button, delete button if needed */}
      {children}
    </div>
  );
};

export default MyCustomStringComponent;
