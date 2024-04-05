import * as React from 'react';

import { QuestionnaireItem, Questionnaire } from 'fhir/r4';

import { Options } from '../../../types/formTypes/radioGroupOptions';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';
import Select from '@helsenorge/designsystem-react/components/Select';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import { getValidationTextExtension, getPlaceholder } from '../../../util/extension';
import { isRequired, getId, getSublabelText, getText, renderPrefix } from '../../../util/index';
import { Resources } from '../../../util/resources';

export interface Props {
  options?: Array<Options>;
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
  id?: string;
  handleChange: (code: string) => void;
  selected?: Array<string | undefined>;
  validateInput: (value: string | undefined) => boolean;
  resources?: Resources;
  renderDeleteButton: (className?: string) => JSX.Element | null;
  repeatButton: JSX.Element;
  children?: React.ReactNode;
  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

class DropdownView extends React.Component<Props, Record<string, unknown>> {
  render(): JSX.Element | null {
    const {
      options,
      item,
      questionnaire,
      id,
      handleChange,
      selected,
      validateInput,
      resources,
      children,
      repeatButton,
      renderDeleteButton,
      renderHelpButton,
      renderHelpElement,
      onRenderMarkdown,
    } = this.props;
    if (!options) {
      return null;
    }

    let placeholder;
    if (getPlaceholder(item)) {
      placeholder = new Option(getPlaceholder(item), '');
    } else if (resources) {
      placeholder = new Option(resources.selectDefaultPlaceholder, '');
    }
    const labelText = `${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire, resources)}`;
    const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
    return (
      <div className="page_refero__component page_refero__component_choice page_refero__component_choice_dropdown">
        {renderHelpElement()}
        <FormGroup legend={getText(item, onRenderMarkdown, questionnaire, resources)} mode="ongrey">
          <Select
            label={
              <Label
                htmlFor={getId(id)}
                labelTexts={[{ text: labelText, type: 'semibold' }]}
                sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
                afterLabelChildren={renderHelpButton()}
              />
            }
            onChange={(e): void => handleChange(e.target.value)}
            selectId={getId(id)}
            className="page_refero__input"
          >
            {placeholder}
            {options.map(dropdownOption => (
              <option key={getId(id) + dropdownOption.label} value={dropdownOption.type}>
                {dropdownOption.label}
              </option>
            ))}
          </Select>
        </FormGroup>

        {renderDeleteButton('page_refero__deletebutton--margin-top')}
        {repeatButton}
        {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
      </div>
    );
  }
}

export default layoutChange(DropdownView);
