import { FieldValues, RegisterOptions, useFormContext } from 'react-hook-form';
import styles from '../common-styles.module.css';
import { Options } from '@/types/formTypes/radioGroupOptions';

import Checkbox from '@helsenorge/designsystem-react/components/Checkbox';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label from '@helsenorge/designsystem-react/components/Label';

import { getId, isReadOnly } from '@/util/index';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { getErrorMessage, required } from '@/components/validation/rules';
import { useSelector } from 'react-redux';
import { GlobalState } from '@/reducers';
import { QuestionnaireItem } from 'fhir/r4';
import { findQuestionnaireItem } from '@/reducers/selectors';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { ReadOnly } from '../read-only/readOnly';
import { shouldValidate } from '@/components/validation/utils';

export type Props = QuestionnaireComponentItemProps & {
  options?: Array<Options>;
  handleChange: (radioButton: string) => void;
  selected?: Array<string | undefined>;
  pdfValue?: string | number;
};

const CheckboxView = (props: Props): JSX.Element | null => {
  const { options, linkId, id, handleChange, idWithLinkIdAndItemIndex, selected, path, children, index, pdf, pdfValue } = props;
  const item = useSelector<GlobalState, QuestionnaireItem | undefined>(state => findQuestionnaireItem(state, linkId));
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
      <FormGroup onColor="ongrey" error={getErrorMessage(item, error)} errorWrapperClassName={styles.paddingBottom}>
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={`${getId(id)}-hn-${index}`}
          labelId={`${getId(id)}-label`}
          testId={`${getId(id)}-label`}
          sublabelId="select-sublsbel"
        />
        {options?.map((option, index) => (
          <Checkbox
            {...rest}
            key={`${option.type}-${index}`}
            inputId={`${getId(id)}-hn-${index}`}
            testId={`${getId(id)}-${index}-checkbox-choice`}
            label={<Label testId={`${getId(id)}-${index}-checkbox-choice-label`} labelTexts={[{ text: option.label }]} />}
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
