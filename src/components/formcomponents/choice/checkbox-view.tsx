import * as React from 'react';

import { QuestionnaireItem, Questionnaire } from 'fhir/r4';
import { Controller } from 'react-hook-form';

import { Options } from '../../../types/formTypes/radioGroupOptions';

import Checkbox from '@helsenorge/designsystem-react/components/Checkbox';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';

import { getValidationTextExtension } from '../../../util/extension';
import { getId, getSublabelText, getText, isRequired, renderPrefix } from '../../../util/index';
import { Resources } from '../../../util/resources';
import { FormProps } from '../../../validation/ReactHookFormHoc';
import { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';

export interface Props extends WithCommonFunctionsAndEnhancedProps, FormProps {
  options?: Array<Options>;
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  id?: string;
  handleChange: (radioButton: string) => void;
  selected?: Array<string | undefined>;
  resources?: Resources;
  repeatButton: JSX.Element;
  renderDeleteButton: (className?: string) => JSX.Element | null;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

const CheckboxView: React.FC<Props> = ({
  options,
  item,
  questionnaire,
  id,
  handleChange,
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
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
  const labelText = `${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire, resources)}`;

  return (
    <div className="page_refero__component page_refero__component_choice page_refero__component_choice_checkbox">
      <FormGroup mode="ongrey" error={error?.message}>
        {renderHelpElement()}
        <Label
          className="page_refero__label"
          labelTexts={[{ text: labelText, type: 'semibold' }]}
          sublabel={<Sublabel id="select-sublsbel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
          afterLabelChildren={renderHelpButton()}
        />
        {options?.map((option, index) => (
          <Controller
            name={idWithLinkIdAndItemIndex}
            key={`${option.type}-${index}`}
            control={control}
            shouldUnregister={true}
            rules={{
              required: {
                message: getValidationTextExtension(item) ?? resources?.formRequiredErrorMessage ?? 'Påkrevd felt',
                value: isRequired(item),
              },
            }}
            render={({ field: { value, onChange, ...rest } }): JSX.Element => (
              <Checkbox
                {...rest}
                inputId={`${id}-${option.type}`}
                testId={`${option.type}-${index}-checkbox-choice`}
                label={<Label labelTexts={[{ text: option.label }]} />}
                checked={value?.some((val: string) => val === option.type)}
                value={option.type}
                onChange={(e): void => {
                  const valueCopy = [...value];
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
            )}
          />
        ))}
      </FormGroup>
      {renderDeleteButton('page_refero__deletebutton--margin-top')}
      {repeatButton}
      {children && <div className="nested-fieldset nested-fieldset--full-height">{children}</div>}
    </div>
  );
};

export default CheckboxView;
