import * as React from 'react';

import { QuestionnaireItem, Questionnaire } from 'fhir/r4';
import { Controller } from 'react-hook-form';

import { Options } from '../../../types/formTypes/radioGroupOptions';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';
import Select from '@helsenorge/designsystem-react/components/Select';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import { getPlaceholder } from '../../../util/extension';
import { getId, getLabelText, getSublabelText, isRequired } from '../../../util/index';
import { Resources } from '../../../util/resources';
import { FormProps } from '../../../validation/ReactHookFormHoc';
import { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';

export interface Props extends WithCommonFunctionsAndEnhancedProps, FormProps {
  options?: Array<Options>;
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  id?: string;
  handleChange: (code: string) => void;
  selected?: Array<string | undefined>;
  resources?: Resources;
  renderDeleteButton: (className?: string) => JSX.Element | null;
  repeatButton: JSX.Element;
  children?: React.ReactNode;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

const DropdownView = (props: Props): JSX.Element | null => {
  const {
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
  } = props;

  let placeholder: HTMLOptionElement;

  if (getPlaceholder(item)) {
    placeholder = new Option(getPlaceholder(item), '');
  } else if (resources) {
    placeholder = new Option(resources.selectDefaultPlaceholder, '');
  }
  const labelText = getLabelText(item, onRenderMarkdown, questionnaire, resources);
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
  const value = selected?.[0] || '';
  return (
    <div className="page_refero__component page_refero__component_choice page_refero__component_choice_dropdown">
      <FormGroup mode="ongrey" error={error?.message}>
        {renderHelpElement()}
        <Controller
          name={idWithLinkIdAndItemIndex}
          shouldUnregister={true}
          control={control}
          defaultValue={value}
          rules={{
            required: {
              message: resources?.formRequiredErrorMessage ?? 'Feltet må fylles ut',
              value: isRequired(item),
            },
          }}
          render={({ field: { onChange, ...rest } }): JSX.Element => (
            <Select
              {...rest}
              label={
                <Label
                  className="page_refero__label"
                  htmlFor={getId(id)}
                  labelTexts={[{ text: labelText, type: 'semibold' }]}
                  sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
                  afterLabelChildren={renderHelpButton()}
                />
              }
              selectId={getId(id)}
              testId={getId(id)}
              onChange={(e): void => {
                onChange(e);
                handleChange(e.target.value);
              }}
              value={value}
              className="page_refero__input"
            >
              <option key={getId(id) + placeholder?.label} value={undefined}>
                {placeholder?.label}
              </option>
              {options?.map(dropdownOption => (
                <option key={getId(id) + dropdownOption.label} value={dropdownOption.type}>
                  {dropdownOption.label}
                </option>
              ))}
            </Select>
          )}
        />
      </FormGroup>

      {renderDeleteButton('page_refero__deletebutton--margin-top')}
      {repeatButton}
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
    </div>
  );
};

export default layoutChange(DropdownView);
