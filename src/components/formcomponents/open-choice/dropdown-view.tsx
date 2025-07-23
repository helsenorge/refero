import React from 'react';

import { FieldValues, RegisterOptions, useFormContext } from 'react-hook-form';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Select from '@helsenorge/designsystem-react/components/Select';

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
  handleChange: (code: string) => void;
  selected?: Array<string | undefined>;
  renderOpenField: () => JSX.Element | undefined;
  pdfValue?: string | number;
};

const DropdownView = (props: Props): JSX.Element | null => {
  const { options, id, handleChange, selected, renderOpenField, idWithLinkIdAndItemIndex, linkId, children, path, index, pdf, pdfValue } =
    props;
  const { formState, getFieldState, register } = useFormContext<FieldValues>();
  const { error } = getFieldState(idWithLinkIdAndItemIndex, formState);
  const item = useAppSelector(state => findQuestionnaireItem(state, linkId));

  const { resources } = useExternalRenderContext();
  const answer = useGetAnswer(linkId, path);

  const getWith = (options: Array<Options> | undefined): number => {
    const maxCharacters = options?.reduce((acc, option) => (option.label.length > acc ? option.label.length : acc), 0);
    const placeholderLength = resources?.selectDefaultPlaceholder ? resources.selectDefaultPlaceholder.length : 0;
    let width = maxCharacters ? (maxCharacters > 40 ? 40 : maxCharacters) : 25;
    return (width = placeholderLength > width ? placeholderLength : width);
  };

  const validationRules: RegisterOptions<FieldValues, string> | undefined = {
    required: required({ item, resources }),
    shouldUnregister: true,
  };
  const onChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    handleChange(e.target.value);
  };
  const { onChange: handleFormChange, ...rest } = register(
    idWithLinkIdAndItemIndex,
    shouldValidate(item, pdf) ? validationRules : undefined
  );

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
    <div className="page_refero__component page_refero__component_openchoice page_refero__component_openchoice_dropdown">
      <FormGroup error={getErrorMessage(item, error)} onColor="ongrey">
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={getId(id)}
          labelId={`${getId(id)}-open-choice-label`}
          testId={`${getId(id)}-open-choice-label`}
          sublabelId={`${getId(id)}-open-choice-sublabel`}
        />

        <Select
          {...rest}
          width={getWith(options)}
          selectId={getId(id)}
          className="page_refero__input"
          testId={`test-openchoice-dropdown-${getId(id)}`}
          onChange={(e): void => {
            handleFormChange(e);
            onChange(e);
          }}
          value={selected?.[0] || ''}
        >
          <option value="" disabled hidden>
            {resources?.selectDefaultPlaceholder || ''}
          </option>
          {options?.map(option => (
            <option key={option.id} value={option.type}>
              {option.label}
            </option>
          ))}
        </Select>
        {shouldShowExtraChoice(answer) && <div className="page_refero__component_openchoice_openfield">{renderOpenField()}</div>}
      </FormGroup>
      <RenderDeleteButton item={item} path={path} index={index} className="page_refero__deletebutton--margin-top" />
      <RenderRepeatButton path={path} item={item} index={index} />
      <div className="nested-fieldset nested-fieldset--full-height">{children}</div>
    </div>
  );
};

export default DropdownView;
