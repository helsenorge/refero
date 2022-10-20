import * as React from 'react';

import { Collapse } from 'react-collapse';

import { QuestionnaireItem, Questionnaire } from '../../../types/fhir';

import CheckBoxGroup from '@helsenorge/form/components/checkbox-group';
import Validation from '@helsenorge/form/components/form/validation';
import { Options } from '@helsenorge/form/components/radio-group';

import { getMaxOccursExtensionValue, getMinOccursExtensionValue, getValidationTextExtension } from '../../../util/extension';
import { isRequired, getId, getSublabelText } from '../../../util/index';
import { Resources } from '../../../util/resources';
import Label from '../label';
import SubLabel from '../sublabel';

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

  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

const CheckboxView: React.SFC<Props> = ({
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
  ...other
}) => {
  if (!options) {
    return null;
  }

  const checkboxes = options.map(el => {
    return { label: el.label, id: el.type, checked: isSelected(el, selected) };
  });
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);

  return (
    <div className="page_refero__component page_refero__component_choice page_refero__component_choice_checkbox">
      <Collapse isOpened>
        <Validation {...other}>
          <CheckBoxGroup
            legend={<Label item={item} onRenderMarkdown={onRenderMarkdown} questionnaire={questionnaire} resources={resources} />}
            subLabel={subLabelText ? <SubLabel subLabelText={subLabelText} /> : undefined}
            checkboxes={checkboxes}
            handleChange={handleChange}
            isRequired={isRequired(item)}
            id={getId(id)}
            max={getMaxOccursExtensionValue(item)}
            min={getMinOccursExtensionValue(item)}
            errorMessage={getValidationTextExtension(item)}
            helpButton={renderHelpButton()}
            helpElement={renderHelpElement()}
            validateOnExternalUpdate={true}
            isStyleBlue
          />
        </Validation>
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
