import { type FieldValues, type RegisterOptions, useFormContext } from 'react-hook-form';

import type { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import type { Options } from '@/types/formTypes/radioGroupOptions';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';

import { renderRadioOptions } from '../choice-common/renderRadioOptions';
import styles from '../common-styles.module.css';
import { ReadOnly } from '../read-only/readOnly';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { getErrorMessage, required } from '@/components/validation/rules';
import { shouldValidate } from '@/components/validation/utils';
import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import { useAppSelector } from '@/reducers';
import { findQuestionnaireItem } from '@/reducers/selectors';
import { shouldShowExtraChoice } from '@/util/choice';
import { getId, isReadOnly } from '@/util/index';

type Props = QuestionnaireComponentItemProps & {
  options?: Array<Options>;
  handleChange: (radioButton: string) => void;
  selected?: Array<string | undefined>;
  renderOpenField: () => React.JSX.Element | undefined;
  pdfValue?: string | number;
};

const RadioView = (props: Props): React.JSX.Element | null => {
  const { options, id, handleChange, selected, renderOpenField, idWithLinkIdAndItemIndex, linkId, path, index, pdf, pdfValue, children } =
    props;
  const { resources } = useExternalRenderContext();
  const { formState, getFieldState, register } = useFormContext<FieldValues>();
  const { error } = getFieldState(idWithLinkIdAndItemIndex, formState);
  const item = useAppSelector(state => findQuestionnaireItem(state, linkId));

  const selectedValue = (selected && selected[0]) || '';
  const answer = useGetAnswer(linkId, path);

  const validationRules: RegisterOptions<FieldValues, string> | undefined = {
    required: required({ item, resources }),
    shouldUnregister: true,
  };
  const registration = register(idWithLinkIdAndItemIndex, shouldValidate(item, pdf) ? validationRules : undefined);

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
      <FormGroup htmlMarkup="div" error={getErrorMessage(item, error)} onColor="ongrey" errorWrapperClassName={styles.paddingBottom}>
        <ReferoLabel
          item={item}
          resources={resources}
          labelId={`${getId(id)}-open-choice-label`}
          testId={`${getId(id)}-open-choice-label`}
          sublabelId={`${getId(id)}-open-choice-sublabel`}
          htmlFor={`${getId(id)}-hn-${index}`}
          formFieldTagId={`${getId(id)}-radio-formfieldtag`}
        />
        {renderRadioOptions({ variant: 'open-choice', id, options, selectedValue, handleChange, registration })}
      </FormGroup>
      {shouldShowExtraChoice(answer) ? <div className="page_refero__component_openchoice_openfield">{renderOpenField()}</div> : null}
      <RenderDeleteButton item={item} path={path} index={index} className="page_refero__deletebutton--margin-top" />
      <RenderRepeatButton path={path} item={item} index={index} />

      <div className="nested-fieldset nested-fieldset--full-height">{children}</div>
    </div>
  );
};

export default RadioView;
