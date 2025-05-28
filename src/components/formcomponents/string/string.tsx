import React from 'react';

import { FieldValues, RegisterOptions, useFormContext } from 'react-hook-form';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';

import styles from '../common-styles.module.css';
import { ReadOnly } from '../read-only/readOnly';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';

import { newValueAsync } from '@/actions/newValue';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { getErrorMessage, maxLength, minLength, regexpPattern, required, scriptInjection } from '@/components/validation/rules';
import { shouldValidate } from '@/components/validation/utils';
import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import useOnAnswerChange from '@/hooks/useOnAnswerChange';
import { useResetFormField } from '@/hooks/useResetFormField';
import { useAppDispatch, useAppSelector } from '@/reducers';
import { findQuestionnaireItem } from '@/reducers/selectors';
import { getPlaceholder } from '@/util/extension';
import { isReadOnly, getId, getStringValue, getPDFStringValue, getMaxLength } from '@/util/index';

export type Props = QuestionnaireComponentItemProps;

export const String = (props: Props): JSX.Element | null => {
  const { path, id, pdf, idWithLinkIdAndItemIndex, children, index, linkId } = props;
  const item = useAppSelector(state => findQuestionnaireItem(state, linkId));

  const { promptLoginMessage, validateScriptInjection, globalOnChange, resources } = useExternalRenderContext();
  const onAnswerChange = useOnAnswerChange(globalOnChange);

  const { formState, getFieldState, register } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex, formState);
  const { error } = fieldState;
  const dispatch = useAppDispatch();
  const answer = useGetAnswer(linkId, path);
  const value = getStringValue(answer);
  useResetFormField(idWithLinkIdAndItemIndex, value);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    if (dispatch && path && item) {
      dispatch(newValueAsync({ itemPath: path, valueString: value, item }))
        .unwrap()
        .then(newState => onAnswerChange(newState, item, { valueString: value }));
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    handleChange(event);
  };
  // const debouncedHandleChange: (event: React.ChangeEvent<HTMLInputElement>) => void = debounce(handleChange, 250, false);
  // const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
  //   event.persist();
  //   debouncedHandleChange(event);
  // };

  const maxCharacters = getMaxLength(item);
  const width = maxCharacters ? (maxCharacters > 40 ? 40 : maxCharacters) : 25;
  const errorMessage = getErrorMessage(item, error);

  const validationRules: RegisterOptions<FieldValues, string> | undefined = {
    required: required({ item, resources }),
    minLength: minLength({ item, resources }),
    maxLength: maxLength({ item, resources }),
    pattern: regexpPattern({ item, resources }),
    validate: (value: string): string | true | undefined =>
      scriptInjection({ value, resources, shouldValidate: !!validateScriptInjection }),
    shouldUnregister: true,
    setValueAs: (value: string): string | undefined => {
      if (value === undefined || value === null || value === '') {
        return undefined;
      }
      return Array.isArray(value) ? value : value?.trim();
    },
  };

  const { onChange, ...rest } = register(idWithLinkIdAndItemIndex, shouldValidate(item, pdf) ? validationRules : undefined);

  if (pdf || isReadOnly(item)) {
    return (
      <ReadOnly
        pdf={pdf}
        id={id}
        idWithLinkIdAndItemIndex={idWithLinkIdAndItemIndex}
        item={item}
        value={value}
        pdfValue={getPDFStringValue(answer, resources)}
        errors={error}
        textClass="page_refero__component_readonlytext"
      >
        {children}
      </ReadOnly>
    );
  }
  return (
    <div className="page_refero__component page_refero__component_string">
      <FormGroup error={errorMessage} onColor="ongrey" errorWrapperClassName={styles.paddingBottom}>
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={getId(id)}
          labelId={`${getId(id)}-string-label`}
          testId={`${getId(id)}-string-label`}
        />
        <Input
          {...rest}
          value={value ?? ''}
          readOnly={item?.readOnly}
          onChange={(e): void => {
            handleInputChange(e);
            onChange(e);
          }}
          type="text"
          width={width}
          testId={`${getId(id)}-string`}
          inputId={getId(id)}
          placeholder={getPlaceholder(item)}
          className="page_refero__input"
        />
        <RenderDeleteButton item={item} path={path} index={index} className="page_refero__deletebutton--margin-top" />
        <RenderRepeatButton path={path} item={item} index={index} />
      </FormGroup>

      {children && <div className="nested-fieldset nested-fieldset--full-height">{children}</div>}
    </div>
  );
};
export default String;
