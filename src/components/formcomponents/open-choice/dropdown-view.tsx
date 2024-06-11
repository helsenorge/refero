import * as React from 'react';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { Controller } from 'react-hook-form';

import { Options } from '../../../types/formTypes/radioGroupOptions';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';
import Select from '@helsenorge/designsystem-react/components/Select';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import { shouldShowExtraChoice } from '../../../util/choice';
import { getValidationTextExtension } from '../../../util/extension';
import { isRequired, getId, getSublabelText, getText } from '../../../util/index';
import { Resources } from '../../../util/resources';
import { FormProps } from '../../../validation/ReactHookFormHoc';
import { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';
import SafeText from '../SafeText';

interface Props extends WithCommonFunctionsAndEnhancedProps, FormProps {
  options?: Array<Options>;
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  id?: string;
  handleChange: (code: string) => void;
  selected?: Array<string | undefined>;
  resources?: Resources;
  renderDeleteButton: (className?: string) => JSX.Element | null;
  repeatButton: JSX.Element;
  renderOpenField: () => JSX.Element | undefined;
  answer: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer;
  children?: React.ReactNode;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

const DropdownView = ({
  options,
  item,
  questionnaire,
  id,
  answer,
  handleChange,
  selected,
  resources,
  children,
  repeatButton,
  renderDeleteButton,
  renderOpenField,
  renderHelpButton,
  renderHelpElement,
  onRenderMarkdown,
  control,
  error,
  idWithLinkIdAndItemIndex,
}: Props): JSX.Element | null => {
  if (!options) {
    return null;
  }
  const onChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    handleChange(e.target.value);
  };
  const labelText = getText(item, onRenderMarkdown, questionnaire, resources);
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
  return (
    <div className="page_refero__component page_refero__component_openchoice page_refero__component_openchoice_dropdown">
      <FormGroup error={error?.message} mode="ongrey">
        {renderHelpElement()}
        <Controller
          name={idWithLinkIdAndItemIndex}
          control={control}
          shouldUnregister={true}
          defaultValue={selected?.[0] || ''}
          rules={{
            required: {
              message: getValidationTextExtension(item) ?? resources?.formRequiredErrorMessage ?? '',
              value: isRequired(item),
            },
          }}
          render={({ field: { onChange: handleChange, ...rest } }): JSX.Element => (
            <Select
              {...rest}
              selectId={getId(id)}
              className="page_refero__input"
              testId={getId(id)}
              label={
                <Label
                  htmlFor={getId(id)}
                  labelTexts={[]}
                  sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
                  afterLabelChildren={renderHelpButton()}
                >
                  <SafeText text={labelText} />
                </Label>
              }
              onChange={(e): void => {
                handleChange(e);
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
          )}
        />
        {shouldShowExtraChoice(answer) && <div className="page_refero__component_openchoice_openfield">{renderOpenField()}</div>}
      </FormGroup>
      {renderDeleteButton('page_refero__deletebutton--margin-top')}
      {repeatButton}
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
    </div>
  );
};

export default layoutChange(DropdownView);
