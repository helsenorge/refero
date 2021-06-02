import * as React from 'react';

import { Collapse } from 'react-collapse';

import CheckBoxGroup from '@helsenorge/toolkit/components/atoms/checkbox-group';
import { Options } from '@helsenorge/toolkit/components/atoms/radio-group';
import Validation from '@helsenorge/toolkit/components/molecules/form/validation';

import { QuestionnaireItem } from '../../../types/fhir';
import { getMaxOccursExtensionValue, getMinOccursExtensionValue, getValidationTextExtension } from '../../../util/extension';
import { renderPrefix, getText, isRequired, getId } from '../../../util/index';
import { Resources } from '../../../util/resources';

interface Props {
  options?: Array<Options>;
  item: QuestionnaireItem;
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
  id,
  handleChange,
  selected,
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
  return (
    <div className="page_skjemautfyller__component page_skjemautfyller__component_choice page_skjemautfyller__component_choice_checkbox">
      <Collapse isOpened>
        <Validation {...other}>
          <CheckBoxGroup
            legend={
              <span
                dangerouslySetInnerHTML={{
                  __html: `${renderPrefix(item)} ${getText(item, onRenderMarkdown)}`,
                }}
              />
            }
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
        {renderDeleteButton('page_skjemautfyller__deletebutton--margin-top')}
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
