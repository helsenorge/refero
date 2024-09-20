import React from 'react';

import { FieldValues, useFormContext } from 'react-hook-form';
import styles from '../common-styles.module.css';
import { Options } from '@/types/formTypes/radioGroupOptions';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Select from '@helsenorge/designsystem-react/components/Select';

import { shouldShowExtraChoice } from '@/util/choice';

import { getId } from '@/util/index';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { useGetAnswer } from '@/hooks/useGetAnswer';
import RenderHelpButton from '@/components/formcomponents/help-button/RenderHelpButton';
import RenderHelpElement from '@/components/formcomponents/help-button/RenderHelpElement';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { required } from '@/components/validation/rules';

type Props = QuestionnaireComponentItemProps & {
  options?: Array<Options>;
  handleChange: (code: string) => void;
  selected?: Array<string | undefined>;
  renderOpenField: () => JSX.Element | undefined;
};

const DropdownView = (props: Props): JSX.Element | null => {
  const {
    options,
    item,
    id,
    handleChange,
    selected,
    resources,
    renderOpenField,
    idWithLinkIdAndItemIndex,
    responseItems,
    responseItem,
    children,
    path,
    index,
  } = props;
  const [isHelpVisible, setIsHelpVisible] = React.useState(false);
  const { formState, getFieldState, register } = useFormContext<FieldValues>();
  const { error } = getFieldState(idWithLinkIdAndItemIndex, formState);

  if (!options) {
    return null;
  }

  const answer = useGetAnswer(responseItem, item);
  const onChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    handleChange(e.target.value);
  };
  const { onChange: handleFormChange, ...rest } = register(idWithLinkIdAndItemIndex, {
    required: required({ item, resources }),
    shouldUnregister: true,
  });
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
          afterLabelContent={<RenderHelpButton isHelpVisible={isHelpVisible} item={item} setIsHelpVisible={setIsHelpVisible} />}
        />
        <RenderHelpElement item={item} isHelpVisible={isHelpVisible} />

        <Select
          {...rest}
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
      <RenderDeleteButton
        item={item}
        path={path}
        index={index}
        responseItem={responseItem}
        className="page_refero__deletebutton--margin-top"
      />
      <RenderRepeatButton path={path?.slice(0, -1)} item={item} index={index} responseItem={responseItem} responseItems={responseItems} />
      <div className="nested-fieldset nested-fieldset--full-height">{children}</div>
    </div>
  );
};

export default DropdownView;
