import * as React from 'react';

import { Collapse } from 'react-collapse';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer } from '../../../types/fhir';
import { Options } from '../../../types/formTypes/radioGroupOptions';

import Validation from '@helsenorge/designsystem-react/components/Validation';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Checkbox from '@helsenorge/designsystem-react/components/Checkbox';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';

import { shouldShowExtraChoice } from '../../../util/choice';
import { Resources } from '../../../util/resources';
import { getSublabelText, getText } from '../../../util';
import { getValidationTextExtension } from '../../../util/extension';

interface Props {
  options?: Array<Options>;
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  id?: string;
  handleChange: (radioButton: string) => void;
  selected?: Array<string | undefined>;
  resources?: Resources;
  repeatButton: JSX.Element;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  renderOpenField: () => JSX.Element | undefined;
  answer: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer;

  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

const CheckboxView: React.SFC<Props> = ({
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
  ...other
}) => {
  if (!options) {
    return null;
  }

  const checkboxes = options.map(el => {
    return { label: el.label, id: el.type, checked: isSelected(el, selected) };
  });
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);

  // checkboxes={checkboxes}
  // handleChange={handleChange}
  // isRequired={isRequired(item)}
  // id={getId(id)}
  // max={getMaxOccursExtensionValue(item)}
  // min={getMinOccursExtensionValue(item)}
  // helpButton={renderHelpButton()}
  // helpElement={renderHelpElement()}
  // validateOnExternalUpdate={true}
  // isStyleBlue

  return (
    <div className="page_refero__component page_refero__component_openchoice page_refero__component_openchoice_checkbox">
      <Collapse isOpened>
        <Validation {...other}>
          <FormGroup legend={getText(item, onRenderMarkdown, questionnaire, resources)}>
            {checkboxes.map((checkbox, index) => (
              <Checkbox
              label={
                <Label
                  labelTexts={[{ text: checkbox.label, type: 'semibold' }]}
                  sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
                />
              }
                key={checkbox.id + index.toString()}
                inputId={`${id}-${checkbox.id}`}
                checked={checkbox.checked}
                onChange={() => handleChange(checkbox.id)}
                testId={`${id}-${checkbox.id}`}
              />
            ))}
          </FormGroup>
        </Validation>
        <Validation>
          <FormGroup>
            <Checkbox label={'Heisann hopp'} key={Math.random().toString()} />
            <Checkbox label={'Heisann hopp 2'} key={Math.random().toString()} />
            <Checkbox label={'Heisann hopp 3'} key={Math.random().toString()} />
          </FormGroup>
        </Validation>
        {shouldShowExtraChoice(answer) ? (
          <div className="page_refero__component_openchoice_openfield">{renderOpenField()}</div>
        ) : (
          <React.Fragment />
        )}
        {renderDeleteButton('page_refero__deletebutton--margin-top')}
        {repeatButton}
        {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
      </Collapse>
    </div>
  );
};

function isSelected(el: Options, selected?: Array<string | undefined>): boolean {
  if (selected) {
    for (let i = 0; i < selected.length; i++) {
      if (el.type === selected[i]) {
        return true;
      }
    }
  }
  return false;
}

export default CheckboxView;
