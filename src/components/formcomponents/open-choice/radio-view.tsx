import * as React from 'react';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { Collapse } from 'react-collapse';
import { Controller, useFormContext } from 'react-hook-form';

import { Options } from '../../../types/formTypes/radioGroupOptions';
import { Resources } from '../../../types/resources';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';
import RadioButton from '@helsenorge/designsystem-react/components/RadioButton';
import Validation from '@helsenorge/designsystem-react/components/Validation';

import { shouldShowExtraChoice } from '../../../util/choice';
import { getId, getSublabelText, getText, isRequired } from '../../../util/index';
import { Path, createFromIdFromPath } from '../../../util/refero-core';

interface Props {
  options?: Array<Options>;
  item: QuestionnaireItem;
  questionnaire?: Questionnaire | null;
  id?: string;
  handleChange: (radioButton: string) => void;
  selected?: Array<string | undefined>;
  validateInput: (value: string) => boolean;
  resources?: Resources;
  renderDeleteButton: (className: string) => JSX.Element | undefined;
  renderOpenField: () => JSX.Element | undefined;
  repeatButton: JSX.Element;
  answer: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  path: Path[];
  children: React.ReactNode;
}

const RadioView = ({
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
  path,
}: Props): JSX.Element | null => {
  if (!options) {
    return null;
  }
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);

  const selectedValue = (selected && selected[0]) || '';
  const formId = createFromIdFromPath(path);
  const { getFieldState, control } = useFormContext();
  const { error } = getFieldState(formId);
  return (
    <div className="page_refero__component page_refero__component_openchoice page_refero__component_openchoice_radiobutton">
      <FormGroup legend={getText(item, onRenderMarkdown, questionnaire, resources)} error={error?.message} mode="ongrey">
        {options.map((option: Options, index: number) => (
          <Controller
            name={formId}
            key={`${getId(id)}-${index.toString()}`}
            control={control}
            render={({ field }): JSX.Element => (
              <RadioButton
                {...field}
                inputId={getId(id) + index}
                testId={getId(id) + index}
                mode="ongrey"
                size="medium"
                onChange={(): void => {
                  handleChange(option.type);
                  field.onChange(option.type);
                }}
                value={option.type}
                label={
                  <Label
                    labelTexts={[{ text: option.label }]}
                    sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
                    afterLabelChildren={<>{renderHelpButton()}</>}
                  />
                }
                defaultChecked={selectedValue === option?.type}
              />
            )}
          />
        ))}
      </FormGroup>
      {shouldShowExtraChoice(answer) && <div className="page_refero__component_openchoice_openfield">{renderOpenField()}</div>}
      {renderDeleteButton('page_refero__deletebutton--margin-top')}
      {repeatButton}
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : undefined}
      {renderHelpElement()}
    </div>
  );
};

export default RadioView;
