import { FieldValues, RegisterOptions, useFormContext } from 'react-hook-form';

import Checkbox from '@helsenorge/designsystem-react/components/Checkbox';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label from '@helsenorge/designsystem-react/components/Label';

import styles from '../common-styles.module.css';
import { ReadOnly } from '../read-only/readOnly';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';

import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { getErrorMessage, required } from '@/components/validation/rules';
import { shouldValidate } from '@/components/validation/utils';
import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { useAppSelector } from '@/reducers';
import { findQuestionnaireItem } from '@/reducers/selectors';
import { Options } from '@/types/formTypes/radioGroupOptions';
import { shouldShowExtraChoice } from '@/util/choice';
import { getId, isReadOnly } from '@/util/index';

type Props = QuestionnaireComponentItemProps & {
  options?: Array<Options>;
  handleChange: (radioButton: string) => void;
  selected?: Array<string | undefined>;
  renderOpenField: () => JSX.Element | undefined;
  pdfValue?: string | number;
};

const CheckboxView = (props: Props): JSX.Element | null => {
  const { options, id, handleChange, index, renderOpenField, idWithLinkIdAndItemIndex, selected, linkId, children, path, pdf, pdfValue } =
    props;
  const { formState, getFieldState, register } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex, formState);
  const { error } = fieldState;
  const { resources } = useExternalRenderContext();
  const item = useAppSelector(state => findQuestionnaireItem(state, linkId));

  const answer = useGetAnswer(linkId, path);

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
    <div className="page_refero__component page_refero__component_openchoice page_refero__component_openchoice_checkbox">
      <FormGroup htmlMarkup="div" error={getErrorMessage(item, error)} onColor="ongrey" errorWrapperClassName={styles.paddingBottom}>
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={`${getId(id)}-hn-${index}`}
          labelId={`${getId(id)}-open-choice-label`}
          testId={`${getId(id)}-open-choice-label`}
          sublabelId={`${getId(id)}-open-choice-sublabel`}
        />

        {options?.map((option, index) => (
          <Checkbox
            {...rest}
            key={option.id}
            inputId={`${getId(id)}-hn-${index}`}
            testId={`${getId(id)}-${index}-checkbox-openchoice`}
            label={
              <Label testId={`${getId(id)}-${index}-checkbox-openchoice-label`} labelTexts={[{ text: option.label, type: 'subdued' }]} />
            }
            checked={selected?.some((val: string | undefined) => val === option?.type)}
            value={option.type}
            onChange={(e): void => {
              onChange(e);
              handleChange(option.type);
            }}
          />
        ))}
      </FormGroup>
      {shouldShowExtraChoice(answer) && <div className="page_refero__component_openchoice_openfield">{renderOpenField()}</div>}
      <RenderDeleteButton item={item} path={path} index={index} className="page_refero__deletebutton--margin-top" />
      <RenderRepeatButton path={path} item={item} index={index} />
      {children && <div className="nested-fieldset nested-fieldset--full-height">{children}</div>}
    </div>
  );
};

export default CheckboxView;
