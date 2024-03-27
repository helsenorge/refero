import * as React from 'react';

import { QuestionnaireItem, Questionnaire } from 'fhir/r4';
import { Controller, useFormContext } from 'react-hook-form';
import { useSelector } from 'react-redux';

import { Options } from '../../../types/formTypes/radioGroupOptions';
import { Resources } from '../../../types/resources';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';
import RadioButton from '@helsenorge/designsystem-react/components/RadioButton';

import { GlobalState } from '../../../store/reducers';
import { getFormDefinition } from '../../../store/selectors';
import { getText, getId, getSublabelText } from '../../../util/index';
import { Path, createFromIdFromPath } from '../../../util/refero-core';

interface Props {
  options?: Array<Options>;
  item: QuestionnaireItem;
  id?: string;
  handleChange: (radioButton: string) => void;
  selected?: Array<string | undefined>;
  validateInput: (value: string) => boolean;
  resources?: Resources;
  getErrorMessage: (val: string) => string;
  renderDeleteButton: (className: string) => JSX.Element | undefined;
  repeatButton: JSX.Element;
  children?: React.ReactNode;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  path: Path[];
}

const RadioView = ({
  options,
  item,
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
  path,
}: Props): JSX.Element | null => {
  if (!options) {
    return null;
  }
  const questionnaire = useSelector<GlobalState, Questionnaire | undefined | null>(state => getFormDefinition(state)?.Content);
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
  const selectedValue = (selected && selected[0]) || '';

  const formId = createFromIdFromPath(path);
  const { getFieldState, control } = useFormContext();
  const { error } = getFieldState(formId);

  return (
    <div className="page_refero__component page_refero__component_choice page_refero__component_choice_radiobutton">
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

      {renderDeleteButton('page_refero__deletebutton--margin-top')}
      {repeatButton}
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : undefined}
      {renderHelpElement()}
    </div>
  );
};

export default RadioView;
