import React from 'react';

import { QuestionnaireItem, Questionnaire } from 'fhir/r4';
import { Controller } from 'react-hook-form';

import { Options } from '../../../types/formTypes/radioGroupOptions';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';
import RadioButton from '@helsenorge/designsystem-react/components/RadioButton';

import { isRequired, getId, getSublabelText, getText, renderPrefix } from '../../../util/index';
import { Resources } from '../../../util/resources';
import { FormProps } from '../../../validation/ReactHookFormHoc';
import { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';
import SafeText from '../SafeText';

export interface Props extends FormProps, WithCommonFunctionsAndEnhancedProps {
  options?: Array<Options>;
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  id?: string;
  handleChange: (radioButton: string) => void;
  selected?: Array<string | undefined>;
  resources?: Resources;
  renderDeleteButton: (className?: string) => JSX.Element | null;
  repeatButton: JSX.Element;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
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
  repeatButton,
  renderDeleteButton,
  renderHelpButton,
  renderHelpElement,
  onRenderMarkdown,
  error,
  control,
  idWithLinkIdAndItemIndex,
}) => {
  const selectedValue = (selected && selected[0]) || '';
  const labelText = `${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire, resources)}`;
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
  return (
    <div className="page_refero__component page_refero__component_choice page_refero__component_choice_radiobutton">
      <FormGroup mode="ongrey" error={error?.message}>
        {renderHelpElement()}
        <Label
          labelTexts={[]}
          sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
          afterLabelChildren={renderHelpButton()}
        >
          <SafeText text={labelText} />
        </Label>
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
      {renderDeleteButton('page_refero__deletebutton--margin-top')}
      {repeatButton}
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : undefined}
    </div>
  );
};

export default RadioView;
