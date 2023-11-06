import * as React from 'react';

import { Collapse } from 'react-collapse';

import { QuestionnaireItem, Questionnaire } from '../../../types/fhir';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';
import Validation from '@helsenorge/designsystem-react/components/Validation';
import Select from '@helsenorge/designsystem-react/components/Select';
import Label, { Sublabel } from '@helsenorge/designsystem-react/components/Label';
import { Options } from '../../../types/formTypes/radioGroupOptions';

import { getValidationTextExtension, getPlaceholder } from '../../../util/extension';
import { isRequired, getId, getSublabelText, getText, renderPrefix } from '../../../util/index';
import { Resources } from '../../../util/resources';
import { useForm } from 'react-hook-form';

interface Props {
  options?: Array<Options>;
  item: QuestionnaireItem;
  questionnaire?: Questionnaire;
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

const DropdownView: React.FC<Props> = (props) => {
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
              htmlFor={getId(id)}
              labelTexts={[{ text: labelText, type: 'semibold' }]}
              sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
              afterLabelChildren={renderHelpButton()}
            />
            {renderHelpElement()}
            <Select
              {...register('dropdownView_choice')}
              selectId={getId(id)}
              name={getId(id)}
              label={
                <Label
                  labelTexts={[{ text: labelText, type: 'semibold' }]}
                  sublabel={<Sublabel id="select-sublabel" sublabelTexts={[{ text: subLabelText, type: 'normal' }]} />}
                />
              }
              required={isRequired(item)}
              value={selected ? selected[0] : undefined}
              errorText={getValidationTextExtension(item)}
              className="page_refero__input"
              onChange={(evt): void => handleChange(evt.target.value)}
            >
              {dropdownOptions.map(dropdownOption => (
                <option value={dropdownOption.label}>{dropdownOption.label}</option>
              ))}
            </Select>
          </Validation>
          {renderDeleteButton('page_refero__deletebutton--margin-top')}
          {repeatButton}
          {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
        </Collapse>
      </div>
    );
}

export default layoutChange(DropdownView);
