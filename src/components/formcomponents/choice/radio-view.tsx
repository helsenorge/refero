import * as React from 'react';

import { QuestionnaireItem, Questionnaire } from 'fhir/r4';
import { Collapse } from 'react-collapse';
import { useFormContext } from 'react-hook-form';

import { Options } from '../../../types/formTypes/radioGroupOptions';
import { Resources } from '../../../types/resources';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';
import RadioButton from '@helsenorge/designsystem-react/components/RadioButton';
import Validation from '@helsenorge/designsystem-react/components/Validation';

import { isRequired, getText, getId, getSublabelText } from '../../../util/index';

interface Props {
  options?: Array<Options>;
  item: QuestionnaireItem;
  questionnaire?: Questionnaire | null;
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
  renderHelpButton,
  renderHelpElement,
  onRenderMarkdown,
}: Props): JSX.Element | null => {
  if (!options) {
    return null;
  }
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
  const selectedValue = (selected && selected[0]) || '';

  // RadioButtonGroup:
  // validator={validateInput}
  // validateOnExternalUpdate={true}
  // isStyleBlue
  const { register, getFieldState } = useFormContext();
  const { error } = getFieldState(getId(item.linkId));
  const handleRadioChange = (option: Options): void => {
    handleChange(option?.type);
  };
  return (
    <div className="page_refero__component page_refero__component_choice page_refero__component_choice_radiobutton">
      <Collapse isOpened>
        <FormGroup legend={getText(item, onRenderMarkdown, questionnaire, resources)} error={error?.message}>
          {options.map((option: Options, index: number) => (
            <RadioButton
              {...register(getId(item.linkId), {
                required: { value: isRequired(item), message: resources?.formRequiredErrorMessage || '' },
                disabled: option.disabled,
                value: option?.type || '',
                onChange: (): void => handleRadioChange(option),
              })}
              inputId={getId(id) + index}
              testId={getId(id) + index}
              key={`${getId(id)}-${index.toString()}`}
              mode="ongrey"
              size="medium"
              label={
                <Label
                  labelTexts={[{ text: option.label }]}
                  sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
                  afterLabelChildren={<>{renderHelpButton()}</>}
                />
              }
              defaultChecked={selectedValue === option?.type}
            />
          ))}
        </FormGroup>

        {renderDeleteButton('page_refero__deletebutton--margin-top')}
        {repeatButton}
        {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : undefined}
        {renderHelpElement()}
      </Collapse>
    </div>
  );
};

export default RadioView;
