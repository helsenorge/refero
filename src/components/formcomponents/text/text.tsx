import React, { useState } from 'react';

import { FieldValues, useFormContext } from 'react-hook-form';
import { ThunkDispatch } from 'redux-thunk';

import Expander from '@helsenorge/designsystem-react/components/Expander';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Textarea from '@helsenorge/designsystem-react/components/Textarea';
import styles from '../common-styles.module.css';
import { debounce } from '@helsenorge/core-utils/debounce';

import { NewValueAction, newStringValueAsync } from '@/actions/newValue';
import Constants from '@/constants/index';
import itemControlConstants from '@/constants/itemcontrol';
import { GlobalState } from '@/reducers';
import { getPlaceholder, getItemControlExtensionValue } from '@/util/extension';
import { isReadOnly, getId, getStringValue, getMaxLength, getPDFStringValue } from '@/util/index';
import { ReferoLabel } from '../../referoLabel/ReferoLabel';
import TextView from '../textview';
import { useDispatch, useSelector } from 'react-redux';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import RenderHelpButton from '@/components/formcomponents/help-button/RenderHelpButton';
import RenderHelpElement from '@/components/formcomponents/help-button/RenderHelpElement';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import Display from '../display/display';
import { maxLength, minLength, regexpPattern, required, scriptInjection } from '@/components/validation/rules';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { findQuestionnaireItem, getResponseItemWithPathSelector } from '@/reducers/selectors';

export type Props = QuestionnaireComponentItemProps & {
  shouldExpanderRenderChildrenWhenClosed?: boolean;
};
export const Text = (props: Props): JSX.Element | null => {
  const { id, pdf, idWithLinkIdAndItemIndex, path, shouldExpanderRenderChildrenWhenClosed, linkId, index, children } = props;
  const { promptLoginMessage, validateScriptInjection, onAnswerChange } = useExternalRenderContext();
  const item = useSelector<GlobalState, QuestionnaireItem | undefined>(state => findQuestionnaireItem(state, linkId));
  const responseItem = useSelector<GlobalState, QuestionnaireResponseItem | undefined>(state =>
    getResponseItemWithPathSelector(state, path)
  );
  const { resources } = useExternalRenderContext();
  const { formState, getFieldState, register } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex, formState);
  const { error } = fieldState;
  const dispatch = useDispatch<ThunkDispatch<GlobalState, void, NewValueAction>>();
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const answer = useGetAnswer(linkId, path);
  const handleChange = (event: React.FormEvent): void => {
    const value = (event.target as HTMLInputElement).value;
    if (dispatch && path && item) {
      dispatch(newStringValueAsync(path, value, item))?.then(newState => onAnswerChange(newState, item, { valueString: value }));
    }

    if (promptLoginMessage) {
      promptLoginMessage();
    }
  };

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

  if (pdf || isReadOnly(item)) {
    return (
      <TextView id={id} item={item} value={getPDFStringValue(answer, resources)} textClass="page_refero__component_readonlytext">
        {children}
      </TextView>
    );
  }

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
    <div className="page_refero__component page_refero__component_text">
      <FormGroup error={error?.message} mode="ongrey" errorWrapperClassName={styles.paddingBottom}>
        <ReferoLabel
          testId={`${getId(id)}-text-label`}
          htmlFor={getId(id)}
          item={item}
          labelId={`${getId(id)}-text-label`}
          resources={resources}
          afterLabelContent={<RenderHelpButton item={item} setIsHelpVisible={setIsHelpVisible} isHelpVisible={isHelpVisible} />}
        />
        <RenderHelpElement item={item} isHelpVisible={isHelpVisible} />

        <Textarea
          {...rest}
          defaultValue={value}
          onChange={(e): void => {
            onTextAreaChange(e);
            onChange(e);
          }}
          textareaId={getId(id)}
          maxRows={Constants.DEFAULT_TEXTAREA_HEIGHT}
          placeholder={getPlaceholder(item)}
          testId={`${getId(id)}-text`}
          grow={true}
          maxCharacters={getMaxLength(item)}
          maxText={getMaxLength(item) ? resources?.maxLengthText?.replace('{0}', `${getMaxLength(item)}`) : ''}
        />

        <RenderDeleteButton
          item={item}
          path={path}
          index={index}
          responseItem={responseItem}
          className="page_refero__deletebutton--margin-top"
        />
        <RenderRepeatButton path={path?.slice(0, -1)} item={item} index={index} responseItem={responseItem} />
      </FormGroup>
      <div className="nested-fieldset nested-fieldset--full-height">{children}</div>
    </div>
  );
};

export default Text;
