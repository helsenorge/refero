import * as React from 'react';

import { Collapse } from 'react-collapse';
import { useForm } from 'react-hook-form';

import { QuestionnaireItem, Questionnaire } from '../../../types/fhir';
import { Options } from '../../../types/formTypes/radioGroupOptions';

import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';
import Select from '@helsenorge/designsystem-react/components/Select';
import Validation from '@helsenorge/designsystem-react/components/Validation';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import { getValidationTextExtension, getPlaceholder } from '../../../util/extension';
import { isRequired, getId, getSublabelText, getText, renderPrefix } from '../../../util/index';
import { Resources } from '../../../util/resources';

interface DropdownViewProps {
  options?: Array<Options>;
  item: QuestionnaireItem;
  questionnaire?: Questionnaire | null;
  id?: string;
  handleChange: (code: string) => void;
  selected?: Array<string | undefined>;
  validateInput: (value: string | undefined) => boolean;
  resources?: Resources;
  renderDeleteButton: (className?: string) => JSX.Element | undefined;
  repeatButton: JSX.Element;
  oneToTwoColumn?: boolean;
  children?: JSX.Element;

  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

const DropdownView: React.FC<DropdownViewProps> = props => {
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
    ...other
  } = props;
  if (!options) {
    return null;
  }

  const { register } = useForm();

  const dropdownOptions: HTMLOptionElement[] = options.map((o: Options) => {
    return new Option(o.label, o.type);
  });
  const selectId = getId(id);

  let placeholder;
  if (getPlaceholder(item)) {
    placeholder = new Option(getPlaceholder(item), '');
  } else if (resources) {
    placeholder = new Option(resources.selectDefaultPlaceholder, '');
  }

  const labelText = `${renderPrefix(item)} ${getText(item, onRenderMarkdown, questionnaire, resources)}`;
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);

  // onChangeValidator={validateInput}

  return (
    <div className="page_refero__component page_refero__component_choice page_refero__component_choice_dropdown">
      <Collapse isOpened>
        <Validation {...other}>
          <Label
            htmlFor={selectId}
            labelTexts={[{ text: labelText, type: 'semibold' }]}
            sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
            afterLabelChildren={renderHelpButton()}
          />
          {renderHelpElement()}
          <Select
            {...register('dropdownView_choice')}
            selectId={selectId}
            name={getId(id)}
            required={isRequired(item)}
            value={selected ? selected[0] : undefined}
            errorText={getValidationTextExtension(item)}
            className="page_refero__input"
            onChange={(evt): void => handleChange(evt.target.value)}
          >
            {dropdownOptions.map(dropdownOption => (
              <option key={selectId + dropdownOption.label} value={dropdownOption.label}>
                {dropdownOption.label}
              </option>
            ))}
          </Select>
        </Validation>
        {renderDeleteButton('page_refero__deletebutton--margin-top')}
        {repeatButton}
        {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
      </Collapse>
    </div>
  );
};

export default layoutChange(DropdownView);
