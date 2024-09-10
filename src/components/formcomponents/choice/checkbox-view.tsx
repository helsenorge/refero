import { useState } from 'react';

import { FieldValues, useFormContext } from 'react-hook-form';

import { Options } from '@/types/formTypes/radioGroupOptions';

import Checkbox from '@helsenorge/designsystem-react/components/Checkbox';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label from '@helsenorge/designsystem-react/components/Label';

import { getId, isRequired } from '@/util/index';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import RenderHelpButton from '@/components/formcomponents/help-button/RenderHelpButton';
import RenderHelpElement from '@/components/formcomponents/help-button/RenderHelpElement';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import { QuestionnaireComponentItemProps } from '@/components/GenerateQuestionnaireComponents';

export type Props = QuestionnaireComponentItemProps & {
  options?: Array<Options>;
  handleChange: (radioButton: string) => void;
  selected?: Array<string | undefined>;
};

const CheckboxView = (props: Props): JSX.Element | null => {
  const {
    options,
    item,
    id,
    handleChange,
    resources,
    idWithLinkIdAndItemIndex,
    selected,
    responseItems,
    responseItem,
    path,
    children,
    index,
  } = props;
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  const { formState, getFieldState, register } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex, formState);
  const { error } = fieldState;
  const { onChange, ...rest } = register(idWithLinkIdAndItemIndex, {
    required: {
      message: resources?.formRequiredErrorMessage ?? 'Påkrevd felt',
      value: isRequired(item),
    },
    shouldUnregister: true,
  });
  return (
    <div className="page_refero__component page_refero__component_choice page_refero__component_choice_checkbox">
      <FormGroup mode="ongrey" error={error?.message}>
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={id}
          labelId={`${getId(id)}-label`}
          testId={`${getId(id)}-label`}
          sublabelId="select-sublsbel"
          afterLabelContent={<RenderHelpButton item={item} setIsHelpVisible={setIsHelpVisible} isHelpVisible={isHelpVisible} />}
        />
        <RenderHelpElement item={item} isHelpVisible={isHelpVisible} />

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

export default CheckboxView;
