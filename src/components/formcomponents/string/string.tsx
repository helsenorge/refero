import React, { useState } from 'react';

import { FieldValues, useFormContext } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import styles from '../common-styles.module.css';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Input from '@helsenorge/designsystem-react/components/Input';

import { NewValueAction, newStringValueAsync } from '@/actions/newValue';
import { GlobalState } from '@/reducers';
import { getPlaceholder } from '@/util/extension';
import { isReadOnly, getId, getStringValue, getPDFStringValue, getMaxLength } from '@/util/index';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import RenderHelpButton from '@/components/formcomponents/help-button/RenderHelpButton';
import RenderHelpElement from '@/components/formcomponents/help-button/RenderHelpElement';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { maxLength, minLength, regexpPattern, required, scriptInjection } from '@/components/validation/rules';
import { debounce } from '@helsenorge/core-utils/debounce';
import { findQuestionnaireItem } from '@/reducers/selectors';
import { QuestionnaireItem } from 'fhir/r4';
import useOnAnswerChange from '@/hooks/useOnAnswerChange';
import { ReadOnly } from '../read-only/readOnly';

export type Props = QuestionnaireComponentItemProps;

export const String = (props: Props): JSX.Element | null => {
  const { path, id, pdf, idWithLinkIdAndItemIndex, children, index, linkId } = props;
  const item = useSelector<GlobalState, QuestionnaireItem | undefined>(state => findQuestionnaireItem(state, linkId));

  const { promptLoginMessage, validateScriptInjection, globalOnChange, resources } = useExternalRenderContext();
  const onAnswerChange = useOnAnswerChange(globalOnChange);

  const { formState, getFieldState, register } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex, formState);
  const { error } = fieldState;
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const answer = useGetAnswer(linkId, path);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    if (dispatch && path && item) {
      dispatch(newStringValueAsync(path, value, item))?.then(newState => {
        return onAnswerChange(newState, item, { valueString: value });
      });
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

  // const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
  //   handleChange(event);
  // };
  const debouncedHandleChange: (event: React.ChangeEvent<HTMLInputElement>) => void = debounce(handleChange, 250, false);
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    event.persist();
    debouncedHandleChange(event);
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
  const maxCharacters = getMaxLength(item);
  const width = maxCharacters ? (maxCharacters > 40 ? 40 : maxCharacters) : 25;

  if (pdf || isReadOnly(item)) {
    return (
      <ReadOnly
        pdf={pdf}
        id={id}
        item={item}
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
      <FormGroup error={error?.message ?? ''} mode="ongrey" errorWrapperClassName={styles.paddingBottom}>
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={getId(id)}
          labelId={`${getId(id)}-string-label`}
          testId={`${getId(id)}-string-label`}
        >
          <RenderHelpButton item={item} setIsHelpVisible={setIsHelpVisible} isHelpVisible={isHelpVisible} />
        </ReferoLabel>
        <RenderHelpElement item={item} isHelpVisible={isHelpVisible} />
        <Input
          {...rest}
          defaultValue={value}
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
        <RenderRepeatButton path={path?.slice(0, -1)} item={item} index={index} />
      </FormGroup>

      {children && <div className="nested-fieldset nested-fieldset--full-height">{children}</div>}
    </div>
  );
};
export default String;
