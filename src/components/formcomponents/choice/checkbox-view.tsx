import { useState } from 'react';

import { Controller, FieldValues, useFormContext } from 'react-hook-form';

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
import { RenderChildrenItems, RenderItemProps } from '../renderChildren/RenderChildrenItems';

export type Props = RenderItemProps & {
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
    onAnswerChange,
    responseItems,
    responseItem,
    path,
    index,
  } = props;
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  const { formState, getFieldState } = useFormContext<FieldValues>();
  const fieldState = getFieldState(idWithLinkIdAndItemIndex, formState);
  const { error } = fieldState;

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
          <Controller
            name={idWithLinkIdAndItemIndex}
            key={`${option.type}-${index}`}
            shouldUnregister={true}
            defaultValue={selected}
            rules={{
              required: {
                message: resources?.formRequiredErrorMessage ?? 'Påkrevd felt',
                value: isRequired(item),
              },
            }}
            render={({ field: { value, onChange, ...rest } }): JSX.Element => {
              return (
                <Checkbox
                  {...rest}
                  inputId={`${getId(id)}-hn-${index}`}
                  testId={`${getId(id)}-${index}-checkbox-choice`}
                  label={<Label testId={`${getId(id)}-${index}-checkbox-choice-label`} labelTexts={[{ text: option.label }]} />}
                  checked={selected?.some((val?: string) => val === option.type)}
                  value={option.type}
                  onChange={(e): void => {
                    const valueCopy = value ? [...value] : [];
                    if (e.target.checked) {
                      valueCopy.push(option.type);
                    } else {
                      const idx = valueCopy.findIndex(code => option.type === code);
                      valueCopy?.splice(idx, 1);
                    }
                    onChange(valueCopy);

                    handleChange(option.type);
                  }}
                />
              );
            }}
          />
        ))}
      </FormGroup>
      <RenderDeleteButton
        item={item}
        path={path}
        index={index}
        onAnswerChange={onAnswerChange}
        responseItem={responseItem}
        resources={resources}
        className="page_refero__deletebutton--margin-top"
      />
      <RenderRepeatButton path={path?.slice(0, -1)} item={item} index={index} responseItem={responseItem} responseItems={responseItems} />
      <div className="nested-fieldset nested-fieldset--full-height">
        <RenderChildrenItems otherProps={props} />
      </div>
    </div>
  );
};

export default CheckboxView;
