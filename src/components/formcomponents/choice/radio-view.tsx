import React, { useState } from 'react';

import { QuestionnaireItem, Questionnaire } from 'fhir/r4';
import { Controller } from 'react-hook-form';

import { Options } from '@/types/formTypes/radioGroupOptions';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label from '@helsenorge/designsystem-react/components/Label';
import RadioButton from '@helsenorge/designsystem-react/components/RadioButton';

import { isRequired, getId } from '@/util/index';
import { Resources } from '@/util/resources';
import { FormProps } from '../../../validation/ReactHookFormHoc';
import { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import RenderHelpButton from '@/components/formcomponents/help-button/RenderHelpButton';
import RenderHelpElement from '@/components/formcomponents/help-button/RenderHelpElement';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import RenderDeleteButton from '../repeat/RenderDeleteButton';

export interface Props extends FormProps, WithCommonFunctionsAndEnhancedProps {
  options?: Array<Options>;
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  id?: string;
  handleChange: (radioButton: string) => void;
  selected?: Array<string | undefined>;
  resources?: Resources;
  renderDeleteButton?: (className?: string) => JSX.Element | null;
  repeatButton?: JSX.Element;
}

const RadioView: React.FC<Props> = ({
  options,
  item,
  questionnaire,
  id,
  handleChange,
  selected,
  resources,
  children,
  onAnswerChange,
  responseItems,
  responseItem,
  path,
  index,
  error,
  control,
  idWithLinkIdAndItemIndex,
}) => {
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const selectedValue = (selected && selected[0]) || '';
  return (
    <div className="page_refero__component page_refero__component_choice page_refero__component_choice_radiobutton">
      <FormGroup mode="ongrey" error={error?.message}>
        <ReferoLabel
          item={item}
          questionnaire={questionnaire}
          resources={resources}
          labelId={`${getId(id)}-choice-label`}
          testId={`${getId(id)}-choice-label`}
          sublabelId={`${getId(id)}-choice-sublabel`}
          afterLabelContent={<RenderHelpButton item={item} setIsHelpVisible={setIsHelpVisible} isHelpVisible={isHelpVisible} />}
        />
        <RenderHelpElement item={item} isHelpVisible={isHelpVisible} />

        {options?.map((option: Options, index: number) => (
          <Controller
            name={idWithLinkIdAndItemIndex}
            key={`${option.type}-${index}`}
            control={control}
            shouldUnregister={true}
            defaultValue={selectedValue}
            rules={{
              required: {
                value: isRequired(item),
                message: resources?.formRequiredErrorMessage ?? 'Feltet må fylles ut',
              },
            }}
            render={({ field: { onChange, ...rest } }): JSX.Element => (
              <RadioButton
                {...rest}
                onChange={(): void => {
                  handleChange(option.type);
                  onChange(option.type);
                }}
                value={option.type}
                key={getId(id) + index}
                inputId={`${getId(id)}-hn-${index}`}
                testId={`${getId(id)}-${index}-radio-choice`}
                mode="ongrey"
                label={<Label testId={`${getId(id)}-${index}-radio-choice-label`} labelTexts={[{ text: option.label }]} />}
                defaultChecked={selectedValue === option?.type}
              />
            )}
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
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : undefined}
    </div>
  );
};

export default RadioView;
