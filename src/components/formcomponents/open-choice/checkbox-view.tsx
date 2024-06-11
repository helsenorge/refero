import * as React from 'react';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { Controller } from 'react-hook-form';

import { Options } from '../../../types/formTypes/radioGroupOptions';

import Checkbox from '@helsenorge/designsystem-react/components/Checkbox';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';

import { shouldShowExtraChoice } from '../../../util/choice';
import { isRequired, getSublabelText, getText, renderPrefix, getId } from '../../../util/index';
import { Resources } from '../../../util/resources';
import { FormProps } from '../../../validation/ReactHookFormHoc';
import { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';
import SafeText from '../SafeText';

interface Props extends WithCommonFunctionsAndEnhancedProps, FormProps {
  options?: Array<Options>;
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  id?: string;
  handleChange: (radioButton: string) => void;
  selected?: Array<string | undefined>;
  resources?: Resources;
  repeatButton: JSX.Element;
  renderDeleteButton: (className?: string) => JSX.Element | null;
  renderOpenField: () => JSX.Element | undefined;
  answer: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  children?: React.ReactNode;
}

const CheckboxView = ({
  options,
  item,
  questionnaire,
  id,
  answer,
  handleChange,
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
  selected,
}: Props): JSX.Element | null => {
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
  const labelText = `${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire, resources)}`;
  return (
    <div className="page_refero__component page_refero__component_openchoice page_refero__component_openchoice_checkbox">
      <FormGroup error={error?.message} mode="ongrey">
        {renderHelpElement()}
        <Label
          labelTexts={[]}
          sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
          afterLabelChildren={renderHelpButton()}
        >
          <SafeText text={labelText} />
        </Label>
        {options?.map((option, index) => (
          <Controller
            name={idWithLinkIdAndItemIndex}
            key={`${option.type}-${index}`}
            control={control}
            shouldUnregister={true}
            defaultValue={selected}
            rules={{
              required: {
                message: resources?.formRequiredErrorMessage ?? 'Påkrevd felt',
                value: isRequired(item),
              },
            }}
            render={({ field: { value, onChange, ...rest } }): JSX.Element => (
              <Checkbox
                {...rest}
                inputId={`${id}-${option.type}`}
                testId={`${getId(id)}-${index}-checkbox-openchoice`}
                label={<Label testId={`${getId(id)}-${index}-checkbox-openchoice-label`} labelTexts={[{ text: option.label }]} />}
                checked={selected?.some((val: string) => val === option.type)}
                value={option.type}
                onChange={(e): void => {
                  const valueCopy = value ? [...value] : [];
                  if (e.target.checked) {
                    valueCopy.push(option.type);
                  } else {
                    const idx = valueCopy.findIndex(code => option.type === code);
                    valueCopy.splice(idx, 1);
                  }
                  onChange(valueCopy);
                  handleChange(option.type);
                }}
              />
            )}
          />
        ))}
      </FormGroup>
      {shouldShowExtraChoice(answer) && <div className="page_refero__component_openchoice_openfield">{renderOpenField()}</div>}
      {renderDeleteButton('page_refero__deletebutton--margin-top')}
      {repeatButton}
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
    </div>
  );
};

export default CheckboxView;
