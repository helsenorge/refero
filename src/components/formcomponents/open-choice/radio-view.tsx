import * as React from 'react';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';

import { Options } from '../../../types/formTypes/radioGroupOptions';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';
import RadioButton from '@helsenorge/designsystem-react/components/RadioButton';

import { shouldShowExtraChoice } from '../../../util/choice';
import { isRequired, getId, getSublabelText, getText } from '../../../util/index';
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
}) => {
  if (!options) {
    return null;
  }
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
  const selectedValue = (selected && selected[0]) || '';
  return (
    <div className="page_refero__component page_refero__component_openchoice page_refero__component_openchoice_radiobutton">
      <FormGroup legend={getText(item, onRenderMarkdown, questionnaire, resources)} error={''} mode="ongrey">
        {renderHelpElement()}
        {options.map((option: Options, index: number) => (
          <RadioButton
            name={getId(id)}
            key={`${getId(id)}-${index.toString()}`}
            inputId={getId(id) + '-hn-' + index}
            testId={getId(id) + index}
            mode="ongrey"
            required={isRequired(item)}
            onChange={(): void => {
              handleChange(option.type);
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
        ))}
      </FormGroup>
      {shouldShowExtraChoice(answer) ? (
        <div className="page_refero__component_openchoice_openfield">{renderOpenField()}</div>
      ) : (
        <React.Fragment />
      )}
      {renderDeleteButton('page_refero__deletebutton--margin-top')}
      {repeatButton}
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : undefined}
    </div>
  );
};

export default RadioView;
