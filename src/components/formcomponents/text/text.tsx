import React from 'react';

import { FieldValues, RegisterOptions, useFormContext } from 'react-hook-form';

import Expander from '@helsenorge/designsystem-react/components/Expander';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Textarea from '@helsenorge/designsystem-react/components/Textarea';

import { debounce } from '@helsenorge/core-utils/debounce';

import { ReferoLabel } from '../../referoLabel/ReferoLabel';
import styles from '../common-styles.module.css';
import Display from '../display/display';
import { ReadOnly } from '../read-only/readOnly';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';

import { newStringValueAsync } from '@/actions/newValue';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { getErrorMessage, maxLength, minLength, regexpPattern, required, scriptInjection } from '@/components/validation/rules';
import { shouldValidate } from '@/components/validation/utils';
import Constants from '@/constants/index';
import itemControlConstants from '@/constants/itemcontrol';
import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import useOnAnswerChange from '@/hooks/useOnAnswerChange';
import { useResetFormField } from '@/hooks/useResetFormField';
import { useAppDispatch, useAppSelector } from '@/reducers';
import { findQuestionnaireItem } from '@/reducers/selectors';
import { getPlaceholder, getItemControlExtensionValue } from '@/util/extension';
import { isReadOnly, getId, getStringValue, getMaxLength, getPDFStringValue } from '@/util/index';

export type Props = QuestionnaireComponentItemProps & {
  shouldExpanderRenderChildrenWhenClosed?: boolean;
};
export const Text = (props: Props): JSX.Element | null => {
  const { id, pdf, idWithLinkIdAndItemIndex, path, shouldExpanderRenderChildrenWhenClosed, linkId, index, children } = props;
  const { promptLoginMessage, validateScriptInjection, globalOnChange, resources } = useExternalRenderContext();
  const item = useAppSelector(state => findQuestionnaireItem(state, linkId));
  const onAnswerChange = useOnAnswerChange(globalOnChange);
  const { formState, getFieldState, register } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex, formState);
  const { error } = fieldState;
  const dispatch = useAppDispatch();
  const answer = useGetAnswer(linkId, path);
  const value = getStringValue(answer);

  useResetFormField(idWithLinkIdAndItemIndex, value, item);
  const handleChange = (event: React.FormEvent): void => {
    const value = (event.target as HTMLInputElement).value;
    if (dispatch && path && item) {
      dispatch(newStringValueAsync(path, value, item))?.then(newState => onAnswerChange(newState, item, { valueString: value }));
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };
  //@ts-expect-error - debounce is not typed
  const debouncedHandleChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void = debounce(handleChange, 250, false);
  const onTextAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    event.persist();
    debouncedHandleChange(event);
  };

  const itemControls = getItemControlExtensionValue(item);
  if (itemControls && itemControls.some(itemControl => itemControl.code === itemControlConstants.HIGHLIGHT)) {
    return <Display {...props} />;
  }

  if (itemControls && itemControls.some(itemControl => itemControl.code === itemControlConstants.SIDEBAR)) {
    return null;
  }

  if (itemControls && itemControls.some(itemControl => itemControl.code === itemControlConstants.INLINE)) {
    return (
      <div id={id} className="page_refero__component page_refero__component_expandabletext">
        <Expander title={item?.text ? item.text : ''} renderChildrenWhenClosed={shouldExpanderRenderChildrenWhenClosed ? true : false}>
          {children}
        </Expander>
      </div>
    );
  }

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
    <div className="page_refero__component page_refero__component_text">
      <FormGroup error={errorMessage} onColor="ongrey" errorWrapperClassName={styles.paddingBottom}>
        <ReferoLabel
          testId={`${getId(id)}-text-label`}
          htmlFor={getId(id)}
          item={item}
          labelId={`${getId(id)}-text-label`}
          resources={resources}
        />

        <Textarea
          {...rest}
          onChange={(e): void => {
            onTextAreaChange(e);
            onChange(e);
          }}
          defaultValue={value}
          textareaId={getId(id)}
          maxRows={Constants.DEFAULT_TEXTAREA_HEIGHT}
          placeholder={getPlaceholder(item)}
          testId={`${getId(id)}-text`}
          grow={true}
          maxCharacters={getMaxLength(item)}
          maxText={resources?.maxCharactersText || ''}
        />

        <RenderDeleteButton item={item} path={path} index={index} className="page_refero__deletebutton--margin-top" />
        <RenderRepeatButton path={path} item={item} index={index} />
      </FormGroup>
      <div className="nested-fieldset nested-fieldset--full-height">{children}</div>
    </div>
  );
};

export default Text;
