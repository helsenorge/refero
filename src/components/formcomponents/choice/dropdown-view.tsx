import * as React from 'react';

import { Collapse } from 'react-collapse';

import { Options } from '@helsenorge/toolkit/components/atoms/radio-group';
import SafeSelect from '@helsenorge/toolkit/components/atoms/safe-select';
import Validation from '@helsenorge/toolkit/components/molecules/form/validation';

import layoutChange from '@helsenorge/core-utils/hoc/layout-change';

import { QuestionnaireItem } from '../../../types/fhir';
import { getValidationTextExtension, getPlaceholder } from '../../../util/extension';
import { isRequired, getId, renderPrefix, getText } from '../../../util/index';
import { Resources } from '../../../util/resources';

interface Props {
  options?: Array<Options>;
  item: QuestionnaireItem;
  id?: string;
  handleChange: (code: string) => void;
  selected?: Array<string | undefined>;
  validateInput: (value: string) => boolean;
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

    let placeholder;
    if (getPlaceholder(item)) {
      placeholder = new Option(getPlaceholder(item), '');
    } else if (resources) {
      placeholder = new Option(resources.selectDefaultPlaceholder, '');
    }

    return (
      <div className="page_skjemautfyller__component page_skjemautfyller__component_choice page_skjemautfyller__component_choice_dropdown">
        <Collapse isOpened>
          <Validation {...other}>
            <SafeSelect
              id={getId(id)}
              selectName={getId(id)}
              showLabel={true}
              label={
                <span
                  dangerouslySetInnerHTML={{
                    __html: `${renderPrefix(item)} ${getText(item, onRenderMarkdown)}`,
                  }}
                />
              }
              isRequired={isRequired(item)}
              onChange={(evt): void => handleChange((evt.target as HTMLInputElement).value)}
              options={dropdownOptions}
              selected={selected ? selected[0] : undefined}
              placeholder={placeholder}
              onChangeValidator={validateInput}
              errorMessage={getValidationTextExtension(item)}
              className="page_skjemautfyller__input"
              helpButton={renderHelpButton()}
              helpElement={renderHelpElement()}
            />
          </Validation>
          {renderDeleteButton('page_skjemautfyller__deletebutton--margin-top')}
          {repeatButton}
          {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
        </Collapse>
      </div>
    );
  }
}

export default layoutChange(DropdownView);
