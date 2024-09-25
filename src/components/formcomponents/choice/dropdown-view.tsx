import { useState } from 'react';

import { FieldValues, useFormContext } from 'react-hook-form';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Select from '@helsenorge/designsystem-react/components/Select';
import styles from '../common-styles.module.css';
import { getPlaceholder } from '@/util/extension';
import { getId, isRequired } from '@/util/index';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { Options } from '@/types/formTypes/radioGroupOptions';
import RenderHelpButton from '@/components/formcomponents/help-button/RenderHelpButton';
import RenderHelpElement from '@/components/formcomponents/help-button/RenderHelpElement';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { required } from '@/components/validation/rules';
import { useSelector } from 'react-redux';
import { findQuestionnaireItem, getResponseItemWithPathSelector } from '@/reducers/selectors';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { GlobalState } from '@/reducers';

export type Props = QuestionnaireComponentItemProps & {
  options?: Array<Options>;
  handleChange: (code: string) => void;
  selected?: Array<string | undefined>;
};

const DropdownView = (props: Props): JSX.Element | null => {
  const { options, linkId, id, handleChange, selected, resources, idWithLinkIdAndItemIndex, path, index, children } = props;
  const item = useSelector<GlobalState, QuestionnaireItem | undefined>(state => findQuestionnaireItem(state, linkId));
  const responseItem = useSelector<GlobalState, QuestionnaireResponseItem | undefined>(state =>
    getResponseItemWithPathSelector(state, path)
  );
  const { formState, getFieldState, register } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex, formState);
  const { error } = fieldState;

  const [isHelpVisible, setIsHelpVisible] = useState(false);
  let placeholder: string | undefined = '';

  if (getPlaceholder(item)) {
    placeholder = getPlaceholder(item);
  } else if (resources) {
    placeholder = resources.selectDefaultPlaceholder;
  }
  const value = selected?.[0] || '';
  const shouldShowPlaceholder = !isRequired(item) || value === '';
  const { onChange, ...rest } = register(idWithLinkIdAndItemIndex, {
    required: required({ item, resources }),
    shouldUnregister: true,
  });

  return (
    <div className="page_refero__component page_refero__component_choice page_refero__component_choice_dropdown">
      <FormGroup mode="ongrey" error={error?.message} errorWrapperClassName={styles.paddingBottom}>
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={getId(id)}
          labelId={`${getId(id)}-label`}
          testId={`${getId(id)}-label`}
          sublabelId="select-sublabel"
          afterLabelContent={<RenderHelpButton item={item} setIsHelpVisible={setIsHelpVisible} isHelpVisible={isHelpVisible} />}
        />
        <RenderHelpElement item={item} isHelpVisible={isHelpVisible} />

        <Select
          {...rest}
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

      <RenderDeleteButton
        item={item}
        path={path}
        index={index}
        responseItem={responseItem}
        className="page_refero__deletebutton--margin-top"
      />
      <RenderRepeatButton path={path?.slice(0, -1)} item={item} index={index} responseItem={responseItem} />
      <div className="nested-fieldset nested-fieldset--full-height">{children}</div>
    </div>
  );
};

export default DropdownView;
