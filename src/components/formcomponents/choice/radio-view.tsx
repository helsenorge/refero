import * as React from 'react';

import { Collapse } from 'react-collapse';

import { QuestionnaireItem, Questionnaire } from '../../../types/fhir';
import { Options } from '../../../types/formTypes/radioGroupOptions';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';
import RadioButton from '@helsenorge/designsystem-react/components/RadioButton';
import Validation from '@helsenorge/designsystem-react/components/Validation';

import { isRequired, getText, getId, getSublabelText } from '../../../util/index';
import { Resources } from '../../../util/resources';

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

  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

const RadioView: React.SFC<Props> = ({
  options,
  item,
  questionnaire,
  id,
  handleChange,
  selected,
  resources,
  children,
  getErrorMessage,
  repeatButton,
  renderDeleteButton,
  renderHelpButton,
  renderHelpElement,
  onRenderMarkdown,
}) => {
  if (!options) {
    return null;
  }
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
  const selectedValue = (selected && selected[0]) || '';

  // RadioButtonGroup:
  // validator={validateInput}
  // helpButton={renderHelpButton()}
  // helpElement={renderHelpElement()}
  // validateOnExternalUpdate={true}
  // isStyleBlue

  return (
    <div className="page_refero__component page_refero__component_choice page_refero__component_choice_radiobutton">
      <Collapse isOpened>
        <FormGroup
          legend={getText(item, onRenderMarkdown, questionnaire, resources)}
          error={getErrorMessage(selectedValue) !== '' ? getErrorMessage(selectedValue) : undefined}
        >
          {options.map((option: Options, index: number) => (
            <RadioButton
              inputId={getId(id)}
              testId={getId(id)}
              key={`${getId(id)}-${index.toString()}`}
              label={
                <Label
                  labelTexts={[{ text: option.label }]}
                  sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
                  afterLabelChildren={<>{renderHelpButton()}</>}
                />
              }
              defaultChecked={selectedValue === option.type}
              value={option.type}
              onChange={() => handleChange}
              disabled={option.disabled}
              required={isRequired(item)}
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
