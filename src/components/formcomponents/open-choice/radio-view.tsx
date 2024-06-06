import * as React from 'react';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { Controller } from 'react-hook-form';

import { Options } from '../../../types/formTypes/radioGroupOptions';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';
import RadioButton from '@helsenorge/designsystem-react/components/RadioButton';

import { shouldShowExtraChoice } from '../../../util/choice';
import { getValidationTextExtension } from '../../../util/extension';
import { isRequired, getId, getSublabelText, getText, renderPrefix } from '../../../util/index';
import { Resources } from '../../../util/resources';
import { FormProps } from '../../../validation/ReactHookFormHoc';
import { WithCommonFunctionsAndEnhancedProps } from '../../with-common-functions';

interface Props extends FormProps, WithCommonFunctionsAndEnhancedProps {
  options?: Array<Options>;
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  id?: string;
  handleChange: (radioButton: string) => void;
  selected?: Array<string | undefined>;
  resources?: Resources;
  renderDeleteButton: (className: string) => JSX.Element | null;
  renderOpenField: () => JSX.Element | undefined;
  repeatButton: JSX.Element;
  answer: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer;
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
  renderOpenField,
  answer,
  renderHelpButton,
  renderHelpElement,
  onRenderMarkdown,
  control,
  error,
  idWithLinkIdAndItemIndex,
}) => {
  if (!options) {
    return null;
  }
  const labelText = `${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire, resources)}`;
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
  const selectedValue = (selected && selected[0]) || '';
  return (
    <div className="page_refero__component page_refero__component_openchoice page_refero__component_openchoice_radiobutton">
      <FormGroup error={error?.message} mode="ongrey">
        {renderHelpElement()}
        <Label
          labelTexts={[{ text: labelText, type: 'semibold' }]}
          sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
          afterLabelChildren={renderHelpButton()}
        />
        {options.map((option: Options, index: number) => (
          <Controller
            name={idWithLinkIdAndItemIndex}
            key={`${option.type}-${index}`}
            control={control}
            shouldUnregister={true}
            rules={{
              required: {
                value: isRequired(item),
                message: getValidationTextExtension(item) ?? resources?.formRequiredErrorMessage ?? 'Feltet må fylles ut',
              },
            }}
            render={({ field: { onChange, ...rest } }): JSX.Element => (
              <RadioButton
                {...rest}
                key={`${getId(id)}-${index.toString()}`}
                inputId={getId(id) + '-hn-' + index}
                testId={`${getId(id)}-${index}-radio-open-choice`}
                value={option.type}
                onChange={(): void => {
                  handleChange(option.type);
                  onChange(option.type);
                }}
                label={<Label testId={`${getId(id)}-${index}-radio-open-choice-label`} labelTexts={[{ text: option.label }]} />}
                defaultChecked={selectedValue === option?.type}
              />
            )}
          />
        ))}
      </FormGroup>
      {shouldShowExtraChoice(answer) ? <div className="page_refero__component_openchoice_openfield">{renderOpenField()}</div> : null}
      {renderDeleteButton('page_refero__deletebutton--margin-top')}
      {repeatButton}
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : undefined}
    </div>
  );
};

export default RadioView;
