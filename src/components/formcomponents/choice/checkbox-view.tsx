import React from 'react';

import { QuestionnaireItem, Questionnaire } from 'fhir/r4';
import { Controller } from 'react-hook-form';

import { Options } from '../../../types/formTypes/radioGroupOptions';

import Checkbox from '@helsenorge/designsystem-react/components/Checkbox';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label from '@helsenorge/designsystem-react/components/Label';

import { getId, isRequired } from '../../../util/index';
import { Resources } from '../../../util/resources';
import { FormProps } from '../../../validation/ReactHookFormHoc';
import { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';

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
  idWithLinkIdAndItemIndex,
  selected,
}) => {
  return (
    <div className="page_refero__component page_refero__component_choice page_refero__component_choice_checkbox">
      <FormGroup mode="ongrey" error={error?.message}>
        {renderHelpElement()}
        <ReferoLabel
          item={item}
          onRenderMarkdown={onRenderMarkdown}
          questionnaire={questionnaire}
          resources={resources}
          htmlFor={id}
          labelId={`${getId(id)}-label`}
          testId={`${getId(id)}-label`}
          renderHelpButton={renderHelpButton}
          sublabelId="select-sublsbel"
        />

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
      {renderDeleteButton('page_refero__deletebutton--margin-top')}
      {repeatButton}
      {children && <div className="nested-fieldset nested-fieldset--full-height">{children}</div>}
    </div>
  );
};

export default CheckboxView;
