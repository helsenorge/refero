import * as React from 'react';

import { Collapse } from 'react-collapse';

import { QuestionnaireItem, Questionnaire } from '../../../types/fhir';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';
import Validation from '@helsenorge/form/components/form/validation';
import { Options } from '@helsenorge/form/components/radio-group';
import SafeSelect from '@helsenorge/form/components/safe-select';

import { getValidationTextExtension, getPlaceholder } from '../../../util/extension';
import { isRequired, getId, getSublabelText } from '../../../util/index';
import { Resources } from '../../../util/resources';
import Label from '../label';
import SubLabel from '../sublabel';

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

class DropdownView extends React.Component<Props, {}> {
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
      ...other
    } = this.props;
    if (!options) {
      return null;
    }
    const dropdownOptions: HTMLOptionElement[] = options.map((o: Options) => {
      return new Option(o.label, o.type);
    });
    const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);

    let placeholder;
    if (getPlaceholder(item)) {
      placeholder = new Option(getPlaceholder(item), '');
    } else if (resources) {
      placeholder = new Option(resources.selectDefaultPlaceholder, '');
    }

    return (
      <div className="page_refero__component page_refero__component_choice page_refero__component_choice_dropdown">
        <Collapse isOpened>
          <Validation {...other}>
            <SafeSelect
              id={getId(id)}
              selectName={getId(id)}
              showLabel={true}
              label={<Label item={item} onRenderMarkdown={onRenderMarkdown} questionnaire={questionnaire} resources={resources} />}
              subLabel={subLabelText ? <SubLabel subLabelText={subLabelText} /> : undefined}
              isRequired={isRequired(item)}
              onChange={(evt): void => handleChange((evt.target as HTMLInputElement).value)}
              options={dropdownOptions}
              selected={selected ? selected[0] : undefined}
              value={selected ? selected[0] : undefined}
              placeholder={placeholder}
              onChangeValidator={validateInput}
              errorMessage={getValidationTextExtension(item)}
              className="page_refero__input"
              helpButton={renderHelpButton()}
              helpElement={renderHelpElement()}
            />
          </Validation>
          {renderDeleteButton('page_refero__deletebutton--margin-top')}
          {repeatButton}
          {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
        </Collapse>
      </div>
    );
  }
}

export default layoutChange(DropdownView);
