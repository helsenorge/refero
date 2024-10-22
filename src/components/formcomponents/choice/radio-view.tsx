import { useState } from 'react';

import { FieldValues, RegisterOptions, useFormContext } from 'react-hook-form';

import { Options } from '@/types/formTypes/radioGroupOptions';
import styles from '../common-styles.module.css';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label from '@helsenorge/designsystem-react/components/Label';
import RadioButton from '@helsenorge/designsystem-react/components/RadioButton';

import { getId, isReadOnly } from '@/util/index';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import RenderHelpButton from '@/components/formcomponents/help-button/RenderHelpButton';
import RenderHelpElement from '@/components/formcomponents/help-button/RenderHelpElement';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import RenderDeleteButton from '../repeat/RenderDeleteButton';

import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { required } from '@/components/validation/rules';
import { useSelector } from 'react-redux';
import { QuestionnaireItem } from 'fhir/r4';
import { findQuestionnaireItem } from '@/reducers/selectors';
import { GlobalState } from '@/reducers';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { ReadOnly } from '../read-only/readOnly';

export type Props = QuestionnaireComponentItemProps & {
  options?: Array<Options>;
  handleChange: (radioButton: string) => void;
  selected?: Array<string | undefined>;
  pdfValue?: string | number;
};

const RadioView = (props: Props): JSX.Element => {
  const { options, id, handleChange, selected, linkId, path, index, idWithLinkIdAndItemIndex, pdf, pdfValue, children } = props;
  const { resources } = useExternalRenderContext();
  const item = useSelector<GlobalState, QuestionnaireItem | undefined>(state => findQuestionnaireItem(state, linkId));

  const { formState, getFieldState, register } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex, formState);
  const { error } = fieldState;

  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const selectedValue = (selected && selected[0]) || '';

  const validationRules: RegisterOptions<FieldValues, string> | undefined = {
    required: required({ item, resources }),
    shouldUnregister: true,
  };

  const { onChange, ...rest } = register(idWithLinkIdAndItemIndex, pdf ? undefined : validationRules);

  if (pdf || isReadOnly(item)) {
    return (
      <ReadOnly
        pdf={pdf}
        id={id}
        idWithLinkIdAndItemIndex={idWithLinkIdAndItemIndex}
        item={item}
        value={selected}
        pdfValue={pdfValue}
        errors={error}
      >
        {children}
      </ReadOnly>
    );
  }
  return (
    <div className="page_refero__component page_refero__component_choice page_refero__component_choice_radiobutton">
      <FormGroup mode="ongrey" error={error?.message} errorWrapperClassName={styles.paddingBottom}>
        <ReferoLabel
          item={item}
          resources={resources}
          labelId={`${getId(id)}-choice-label`}
          testId={`${getId(id)}-choice-label`}
          sublabelId={`${getId(id)}-choice-sublabel`}
          afterLabelChildren={<RenderHelpButton item={item} setIsHelpVisible={setIsHelpVisible} isHelpVisible={isHelpVisible} />}
        />
        <RenderHelpElement item={item} isHelpVisible={isHelpVisible} />
        {options?.map((option: Options, index: number) => (
          <RadioButton
            {...rest}
            onChange={(e): void => {
              handleChange(option.type);
              onChange(e);
            }}
            value={option.type}
            key={getId(id) + index}
            inputId={`${getId(id)}-hn-${index}`}
            testId={`${getId(id)}-${index}-radio-choice`}
            mode="ongrey"
            label={<Label testId={`${getId(id)}-${index}-radio-choice-label`} labelTexts={[{ text: option.label }]} />}
            defaultChecked={selectedValue === option?.type}
          />
        ))}
      </FormGroup>
      <RenderDeleteButton item={item} path={path} index={index} className="page_refero__deletebutton--margin-top" />
      <RenderRepeatButton path={path} item={item} index={index} />
      <div className="nested-fieldset nested-fieldset--full-height">{children}</div>
    </div>
  );
};

export default RadioView;
