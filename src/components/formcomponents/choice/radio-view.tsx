import * as React from 'react';

import { Collapse } from 'react-collapse';

import { QuestionnaireItem, Questionnaire } from '../../../types/fhir';
import { Options } from '../../../types/formTypes/radioGroupOptions';

import Validation from '@helsenorge/designsystem-react/components/Validation';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import RadioButton from '@helsenorge/designsystem-react/components/RadioButton';

import { isRequired, getText, getId } from '../../../util/index';
import { Resources } from '../../../util/resources';

interface Props {
  options?: Array<Options>;
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
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
  validateInput,
  resources,
  children,
  getErrorMessage,
  repeatButton,
  renderDeleteButton,
  renderHelpButton,
  renderHelpElement,
  onRenderMarkdown,
  ...other
}) => {
  if (!options) {
    return null;
  }
  // const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);

  // subLabel={subLabelText ? <SubLabel subLabelText={subLabelText} /> : undefined}
  // selected={selected ? selected[0] : undefined}
  // validator={validateInput}
  // getErrorMessage={getErrorMessage}
  // helpButton={renderHelpButton()}
  // helpElement={renderHelpElement()}
  // validateOnExternalUpdate={true}
  // isStyleBlue

  return (
    <div className="page_refero__component page_refero__component_choice page_refero__component_choice_radiobutton">
      <Collapse isOpened>
        <Validation {...other}>
          <FormGroup legend={getText(item, onRenderMarkdown, questionnaire, resources)}>
            {options.map((option: Options, index: number) => (
              <RadioButton
                inputId={getId(id)}
                key={getId(id) + index.toString()}
                label={option.label}
                required={isRequired(item)}
                value={option.type}
                onChange={() => handleChange}
                disabled={option.disabled}
              />
            ))}
          </FormGroup>
        </Validation>
        {renderDeleteButton('page_refero__deletebutton--margin-top')}
        {repeatButton}
        {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : undefined}
      </Collapse>
    </div>
  );
};

export default RadioView;
