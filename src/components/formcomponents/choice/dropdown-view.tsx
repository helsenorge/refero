import { FieldValues, RegisterOptions, useFormContext } from 'react-hook-form';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Select from '@helsenorge/designsystem-react/components/Select';
import styles from '../common-styles.module.css';
import { getPlaceholder } from '@/util/extension';
import { getId, isReadOnly, isRequired } from '@/util/index';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { Options } from '@/types/formTypes/radioGroupOptions';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { getErrorMessage, required } from '@/components/validation/rules';
import { useSelector } from 'react-redux';
import { findQuestionnaireItem } from '@/reducers/selectors';
import { QuestionnaireItem } from 'fhir/r4';
import { GlobalState } from '@/reducers';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { ReadOnly } from '../read-only/readOnly';
import { shouldValidate } from '@/components/validation/utils';

export type Props = QuestionnaireComponentItemProps & {
  options?: Array<Options>;
  handleChange: (code: string) => void;
  selected?: Array<string | undefined>;
  pdfValue?: string | number;
};

const DropdownView = (props: Props): JSX.Element | null => {
  const { options, linkId, id, handleChange, selected, idWithLinkIdAndItemIndex, path, index, pdf, pdfValue, children } = props;
  const { resources } = useExternalRenderContext();
  const item = useSelector<GlobalState, QuestionnaireItem | undefined>(state => findQuestionnaireItem(state, linkId));

  const { formState, getFieldState, register } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex, formState);
  const { error } = fieldState;

  let placeholder: string | undefined = '';

  if (getPlaceholder(item)) {
    placeholder = getPlaceholder(item);
  } else if (resources) {
    placeholder = resources.selectDefaultPlaceholder;
  }
  const value = selected?.[0] || '';
  const shouldShowPlaceholder = !isRequired(item) || value === '';
  const getWith = (options: Array<Options> | undefined): number => {
    const maxCharacters = options?.reduce((acc, option) => (option.label.length > acc ? option.label.length : acc), 0);
    const placeholderLength = placeholder ? placeholder.length : 0;
    let width = maxCharacters ? (maxCharacters > 40 ? 40 : maxCharacters) : 25;
    return (width = placeholderLength > width ? placeholderLength : width);
  };

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
    <div className="page_refero__component page_refero__component_choice page_refero__component_choice_dropdown">
      <FormGroup mode="ongrey" error={getErrorMessage(item, error)} errorWrapperClassName={styles.paddingBottom}>
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={getId(id)}
          labelId={`${getId(id)}-label`}
          testId={`${getId(id)}-label`}
          sublabelId="select-sublabel"
        />
        <Select
          {...rest}
          width={getWith(options)}
          value={value}
          selectId={getId(id)}
          testId={getId(id)}
          onChange={(e): void => {
            onChange(e);
            handleChange(e.target.value);
          }}
          className="page_refero__input"
        >
          {shouldShowPlaceholder && (
            <option key={getId(id) + placeholder} value={''}>
              {placeholder}
            </option>
          )}
          {options?.map(dropdownOption => (
            <option key={getId(id) + dropdownOption.label} value={dropdownOption.type}>
              {dropdownOption.label}
            </option>
          ))}
        </Select>
      </FormGroup>

      <RenderDeleteButton item={item} path={path} index={index} className="page_refero__deletebutton--margin-top" />
      <RenderRepeatButton path={path} item={item} index={index} />
      <div className="nested-fieldset nested-fieldset--full-height">{children}</div>
    </div>
  );
};

export default DropdownView;
