import { FieldValues, RegisterOptions, useFormContext } from 'react-hook-form';

import { Options } from '@/types/formTypes/radioGroupOptions';
import styles from '../common-styles.module.css';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label from '@helsenorge/designsystem-react/components/Label';
import RadioButton from '@helsenorge/designsystem-react/components/RadioButton';

import { shouldShowExtraChoice } from '@/util/choice';
import { getId, isReadOnly } from '@/util/index';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { useGetAnswer } from '@/hooks/useGetAnswer';
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

type Props = QuestionnaireComponentItemProps & {
  options?: Array<Options>;
  handleChange: (radioButton: string) => void;
  selected?: Array<string | undefined>;
  renderOpenField: () => JSX.Element | undefined;
  pdfValue?: string | number;
};

const RadioView = (props: Props): JSX.Element | null => {
  const { options, id, handleChange, selected, renderOpenField, idWithLinkIdAndItemIndex, linkId, path, index, pdf, pdfValue, children } =
    props;
  const { resources } = useExternalRenderContext();
  const { formState, getFieldState, register } = useFormContext<FieldValues>();
  const { error } = getFieldState(idWithLinkIdAndItemIndex, formState);
  const item = useSelector<GlobalState, QuestionnaireItem | undefined>(state => findQuestionnaireItem(state, linkId));

  const selectedValue = (selected && selected[0]) || '';
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
    <div className="page_refero__component page_refero__component_openchoice page_refero__component_openchoice_radiobutton">
      <FormGroup error={getErrorMessage(item, error)} mode="ongrey" errorWrapperClassName={styles.paddingBottom}>
        <ReferoLabel
          item={item}
          resources={resources}
          labelId={`${getId(id)}-open-choice-label`}
          testId={`${getId(id)}-open-choice-label`}
          sublabelId={`${getId(id)}-open-choice-sublabel`}
        />
        {options?.map((option: Options, index: number) => (
          <RadioButton
            {...rest}
            key={`${getId(id)}-${index.toString()}`}
            inputId={getId(id) + '-hn-' + index}
            testId={`${getId(id)}-${index}-radio-open-choice`}
            value={option.type}
            onChange={(e): void => {
              handleChange(option.type);
              onChange(e);
            }}
            label={<Label testId={`${getId(id)}-${index}-radio-open-choice-label`} labelTexts={[{ text: option.label }]} />}
            defaultChecked={selectedValue === option?.type}
          />
        ))}
      </FormGroup>
      {shouldShowExtraChoice(answer) ? <div className="page_refero__component_openchoice_openfield">{renderOpenField()}</div> : null}
      <RenderDeleteButton item={item} path={path} index={index} className="page_refero__deletebutton--margin-top" />
      <RenderRepeatButton path={path} item={item} index={index} />

      <div className="nested-fieldset nested-fieldset--full-height">{children}</div>
    </div>
  );
};

export default RadioView;
