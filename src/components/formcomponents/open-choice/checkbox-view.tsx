import * as React from 'react';

import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { Collapse } from 'react-collapse';
import { useFormContext } from 'react-hook-form';

import { Options } from '../../../types/formTypes/radioGroupOptions';
import { Resources } from '../../../types/resources';

import Checkbox from '@helsenorge/designsystem-react/components/Checkbox';
import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';
import Validation from '@helsenorge/designsystem-react/components/Validation';

import { getId, getSublabelText, getText, isRequired } from '../../../util';
import { shouldShowExtraChoice } from '../../../util/choice';

interface Props {
  options?: Array<Options>;
  item: QuestionnaireItem;
  questionnaire?: Questionnaire | null;
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
}) => {
  if (!options) {
    return null;
  }
  const { register, getFieldState, getValues } = useFormContext();
  const { error, invalid } = getFieldState(getId(item.linkId));
  const checkboxes = options.map(el => {
    return { label: el.label, id: el.type, checked: isSelected(el, selected) };
  });
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);

  // CheckboxGroup:
  // id={getId(id)}
  // max={getMaxOccursExtensionValue(item)}
  // min={getMinOccursExtensionValue(item)}
  // helpButton={renderHelpButton()}
  // helpElement={renderHelpElement()}
  // validateOnExternalUpdate={true}
  // isStyleBlue
  const values = getValues(item.linkId);
  console.log('checkbox: ', values);
  return (
    <div className="page_refero__component page_refero__component_openchoice page_refero__component_openchoice_checkbox">
      <Collapse isOpened>
        <FormGroup legend={getText(item, onRenderMarkdown, questionnaire, resources)} error={error?.message}>
          {checkboxes.map((checkbox, index) => (
            <Checkbox
              {...register(getId(item.linkId), {
                required: isRequired(item),
                onChange: e => console.log('e', e),
              })}
              inputId={`${id}-${checkbox.id}`}
              testId={`checkbox-openChoice`}
              key={`${checkbox.id}-${index.toString()}`}
              label={
                <Label
                  labelTexts={[{ text: checkbox.label }]}
                  sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
                  afterLabelChildren={<>{renderHelpButton()}</>}
                />
              }
              checked={checkbox.checked}
            />
          ))}
        </FormGroup>
        {shouldShowExtraChoice(answer) && <div className="page_refero__component_openchoice_openfield">{renderOpenField()}</div>}

        {renderDeleteButton('page_refero__deletebutton--margin-top')}
        {repeatButton}
        {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
        {renderHelpElement()}
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
