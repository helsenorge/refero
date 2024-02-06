import * as React from 'react';

import { Collapse } from 'react-collapse';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer } from '../../../types/fhir';
import { Options } from '../../../types/formTypes/radioGroupOptions';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';
import RadioButton from '@helsenorge/designsystem-react/components/RadioButton';
import Validation from '@helsenorge/designsystem-react/components/Validation';

import { shouldShowExtraChoice, validateInput } from '../../../util/choice';
import { getId, getSublabelText, getText, isRequired } from '../../../util/index';
import { Resources } from '../../../types/resources';
import { useFormContext } from 'react-hook-form';

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
  renderOpenField: () => JSX.Element | undefined;
  repeatButton: JSX.Element;
  answer: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer;

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
  // validateInput,
  resources,
  children,
  getErrorMessage,
  repeatButton,
  renderDeleteButton,
  renderOpenField,
  answer,
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
  // validateOnExternalUpdate={true}

  const { register } = useFormContext();
  return (
    <div className="page_refero__component page_refero__component_openchoice page_refero__component_openchoice_radiobutton">
      <Collapse isOpened>
        <FormGroup
          legend={getText(item, onRenderMarkdown, questionnaire, resources)}
          error={getErrorMessage(selectedValue) !== '' ? getErrorMessage(selectedValue) : undefined}
        >
          {options.map((option: Options, index: number) => (
            <RadioButton
              {...register(getId(item.linkId), { required: isRequired(item), onChange: handleChange })}
              inputId={getId(id) + index.toLocaleString()}
              size="medium"
              testId="radioButton-openChoice"
              key={`${getId(id)}-${index.toString()}`}
              mode="onwhite"
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
        {shouldShowExtraChoice(answer) && <div className="page_refero__component_openchoice_openfield">{renderOpenField()}</div>}
        {renderDeleteButton('page_refero__deletebutton--margin-top')}
        {repeatButton}
        {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : undefined}
        {renderHelpElement()}
      </Collapse>
    </div>
  );
};

export default RadioView;
