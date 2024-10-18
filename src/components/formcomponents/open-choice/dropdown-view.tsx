import React from 'react';

import { FieldValues, useFormContext } from 'react-hook-form';
import styles from '../common-styles.module.css';
import { Options } from '@/types/formTypes/radioGroupOptions';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Select from '@helsenorge/designsystem-react/components/Select';

import { shouldShowExtraChoice } from '@/util/choice';

import { getId, isReadOnly } from '@/util/index';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import RenderHelpButton from '@/components/formcomponents/help-button/RenderHelpButton';
import RenderHelpElement from '@/components/formcomponents/help-button/RenderHelpElement';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { required } from '@/components/validation/rules';
import { useSelector } from 'react-redux';
import { findQuestionnaireItem } from '@/reducers/selectors';
import { GlobalState } from '@/reducers';
import { QuestionnaireItem } from 'fhir/r4';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { ReadOnly } from '../read-only/readOnly';

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
  const [isHelpVisible, setIsHelpVisible] = React.useState(false);
  const { formState, getFieldState, register } = useFormContext<FieldValues>();
  const { error } = getFieldState(idWithLinkIdAndItemIndex, formState);
  const item = useSelector<GlobalState, QuestionnaireItem | undefined>(state => findQuestionnaireItem(state, linkId));

  const { resources } = useExternalRenderContext();
  const answer = useGetAnswer(linkId, path);
  const onChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    handleChange(e.target.value);
  };
  const { onChange: handleFormChange, ...rest } = register(idWithLinkIdAndItemIndex, {
    required: required({ item, resources }),
    shouldUnregister: true,
  });
  if (!options) {
    return null;
  }
  const getWith = (options: Array<Options>): number => {
    const maxCharacters = options?.reduce((acc, option) => (option.label.length > acc ? option.label.length : acc), 0);
    const placeholderLength = resources?.selectDefaultPlaceholder ? resources.selectDefaultPlaceholder.length : 0;
    let width = maxCharacters ? (maxCharacters > 40 ? 40 : maxCharacters) : 25;
    return (width = placeholderLength > width ? placeholderLength : width);
  };

  if (pdf || isReadOnly(item)) {
    return (
      <ReadOnly pdf={pdf} id={id} item={item} pdfValue={pdfValue} errors={error}>
        {children}
      </ReadOnly>
    );
  }
  return (
    <div className="page_refero__component page_refero__component_openchoice page_refero__component_openchoice_dropdown">
      <FormGroup error={error?.message} mode="ongrey" errorWrapperClassName={styles.paddingBottom}>
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={getId(id)}
          labelId={`${getId(id)}-open-choice-label`}
          testId={`${getId(id)}-open-choice-label`}
          sublabelId={`${getId(id)}-open-choice-sublabel`}
        >
          <RenderHelpButton item={item} setIsHelpVisible={setIsHelpVisible} isHelpVisible={isHelpVisible} />
        </ReferoLabel>
        <RenderHelpElement item={item} isHelpVisible={isHelpVisible} />

        <Select
          {...rest}
          width={getWith(options)}
          selectId={getId(id)}
          className="page_refero__input"
          testId={getId(id)}
          onChange={(e): void => {
            handleFormChange(e);
            onChange(e);
          }}
          value={selected?.[0] || ''}
        >
          <option value={undefined}>{resources?.selectDefaultPlaceholder || ''}</option>
          {options.map(option => (
            <option key={getId(id) + option.label} value={option.type}>
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
