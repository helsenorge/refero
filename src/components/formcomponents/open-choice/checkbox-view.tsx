import * as React from 'react';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { Collapse } from 'react-collapse';
import { useFormContext } from 'react-hook-form';
import { useSelector } from 'react-redux';

import { Options } from '../../../types/formTypes/radioGroupOptions';
import { Resources } from '../../../types/resources';

import Checkbox from '@helsenorge/designsystem-react/components/Checkbox';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';

import { GlobalState } from '../../../store/reducers';
import { getFormDefinition } from '../../../store/selectors';
import { getSublabelText, getText } from '../../../util';
import { shouldShowExtraChoice } from '../../../util/choice';
import { Path, createFromIdFromPath } from '../../../util/refero-core';

interface Props {
  options?: Array<Options>;
  item: QuestionnaireItem;
  id?: string;
  handleChange: (radioButton: string) => void;
  selected?: Array<string | undefined>;
  resources?: Resources;
  repeatButton: JSX.Element;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  renderOpenField: () => JSX.Element | undefined;
  answer: Array<QuestionnaireResponseItemAnswer> | QuestionnaireResponseItemAnswer;
  path: Path[];
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  children: React.ReactNode;
}

const CheckboxView = ({
  options,
  item,
  id,
  answer,
  handleChange,
  selected,
  resources,
  repeatButton,
  renderDeleteButton,
  renderOpenField,
  renderHelpButton,
  renderHelpElement,
  onRenderMarkdown,
  path,
  children,
}: Props): JSX.Element | null => {
  if (!options) {
    return null;
  }
  const questionnaire = useSelector<GlobalState, Questionnaire | undefined | null>(state => getFormDefinition(state)?.Content);

  const checkboxes = options.map(el => {
    return { label: el.label, id: el.type, checked: isSelected(el, selected) };
  });
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);

  // CheckboxGroup:

  // max={getMaxOccursExtensionValue(item)}
  // min={getMinOccursExtensionValue(item)}
  // validateOnExternalUpdate={true}
  // isStyleBlue

  const formId = createFromIdFromPath(path);
  const { getFieldState, register } = useFormContext();
  const { error } = getFieldState(formId);
  return (
    <div className="page_refero__component page_refero__component_openchoice page_refero__component_openchoice_checkbox">
      <FormGroup legend={getText(item, onRenderMarkdown, questionnaire, resources)} error={error?.message} mode="ongrey">
        {checkboxes.map((checkbox, index) => (
          <Checkbox
            {...register(formId)}
            inputId={`${id}-${checkbox.id}`}
            testId={`checkbox-openChoice`}
            key={`${checkbox.id}-${index.toString()}`}
            onChange={(): void => {
              handleChange(checkbox.id);
            }}
            label={
              <Label
                labelTexts={[{ text: checkbox.label }]}
                sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
                afterLabelChildren={<>{renderHelpButton()}</>}
              />
            }
            value={checkbox.id}
            checked={checkbox.checked}
          />
        ))}
      </FormGroup>
      {shouldShowExtraChoice(answer) && <div className="page_refero__component_openchoice_openfield">{renderOpenField()}</div>}
      {renderDeleteButton('page_refero__deletebutton--margin-top')}
      {repeatButton}
      {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
      {renderHelpElement()}
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
