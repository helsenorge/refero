import { type FieldValues, type RegisterOptions, useFormContext } from 'react-hook-form';

import type { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import type { Options } from '@/types/formTypes/radioGroupOptions';

import Checkbox from '@helsenorge/designsystem-react/components/Checkbox';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label from '@helsenorge/designsystem-react/components/Label';

import styles from '../common-styles.module.css';
import { ReadOnly } from '../read-only/readOnly';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { getErrorMessage, required } from '@/components/validation/rules';
import { shouldValidate } from '@/components/validation/utils';
import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';
import { useAppSelector } from '@/reducers';
import { findQuestionnaireItem } from '@/reducers/selectors';
import { getId, isReadOnly } from '@/util/index';

export type Props = QuestionnaireComponentItemProps & {
  options?: Array<Options>;
  handleChange: (radioButton: string) => void;
  selected?: Array<string | undefined>;
  pdfValue?: string | number;
};

const CheckboxView = (props: Props): React.JSX.Element | null => {
  const { options, linkId, id, handleChange, idWithLinkIdAndItemIndex, selected, path, children, index, pdf, pdfValue } = props;
  const item = useAppSelector(state => findQuestionnaireItem(state, linkId));
  const { resources } = useExternalRenderContext();

  const { formState, getFieldState, register } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex, formState);
  const { error } = fieldState;

  const validationRules: RegisterOptions<FieldValues, string> | undefined = {
    required: required({ item, resources }),
    shouldUnregister: true,
  };
  const { onChange, ...rest } = register(idWithLinkIdAndItemIndex, shouldValidate(item, pdf) ? validationRules : undefined);

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
    <div className="page_refero__component page_refero__component_choice page_refero__component_choice_checkbox">
      <FormGroup htmlMarkup="div" onColor="ongrey" error={getErrorMessage(item, error)} errorWrapperClassName={styles.paddingBottom}>
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={`${getId(id)}-hn-${index}`}
          labelId={`${getId(id)}-label`}
          testId={`${getId(id)}-label`}
          sublabelId="select-sublsbel"
          formFieldTagId={`${getId(id)}-checkbox-formfieldtag`}
        />
        {options?.map((option, index) => (
          <Checkbox
            {...rest}
            aria-describedby={`${getId(id)}-checkbox-formfieldtag`}
            key={option.id}
            inputId={`${getId(id)}-hn-${index}`}
            testId={`test-choice-checkbox-${getId(id)}-${index}`}
            label={<Label testId={`${getId(id)}-${index}-checkbox-choice-label`} labelTexts={[{ text: option.label, type: 'subdued' }]} />}
            checked={selected?.some((val?: string) => val === option.type)}
            value={option.type}
            onChange={(e): void => {
              onChange(e);
              handleChange(option.type);
            }}
          />
        ))}
      </FormGroup>
      <RenderDeleteButton item={item} path={path} index={index} className="page_refero__deletebutton--margin-top" />
      <RenderRepeatButton path={path} item={item} index={index} />
      <div className="nested-fieldset nested-fieldset--full-height">{children}</div>
    </div>
  );
};

export default CheckboxView;
