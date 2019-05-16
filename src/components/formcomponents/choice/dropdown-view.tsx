import * as React from 'react';
import { getValidationTextExtension, getPlaceholder } from '../../../util/extension';
import { Options } from '@helsenorge/toolkit/components/atoms/radio-group';
import { isRequired, getId, renderPrefix, getText } from '../../../util/index';
import { Collapse } from 'react-collapse';
import Validation from '@helsenorge/toolkit/components/molecules/form/validation';
import SafeSelect from '@helsenorge/toolkit/components/atoms/safe-select';
import { Resources } from '../../../util/resources';
import layoutChange from '@helsenorge/toolkit/higher-order-components/layoutChange';

import { QuestionnaireItem } from '../../../types/fhir';

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
}

class DropdownView extends React.Component<Props, {}> {
  render() {
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
      oneToTwoColumn,
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
        <Collapse isOpened hasNestedCollapse={true}>
          <Validation {...other}>
            <SafeSelect
              id={getId(id)}
              selectName={getId(id)}
              showLabel={true}
              label={
                <span
                  dangerouslySetInnerHTML={{
                    __html: `${renderPrefix(item)} ${getText(item)}`,
                  }}
                />
              }
              isRequired={isRequired(item)}
              onChange={evt => handleChange((evt.target as HTMLInputElement).value)}
              options={dropdownOptions}
              selected={selected ? selected[0] : undefined}
              placeholder={placeholder}
              onChangeValidator={validateInput}
              errorMessage={getValidationTextExtension(item)}
              className="page_skjemautfyller__input"
            >
              {!oneToTwoColumn ? renderDeleteButton('page_skjemautfyller__deletebutton--margin-left') : null}
            </SafeSelect>
          </Validation>
          {oneToTwoColumn ? (
            <div>
              {renderDeleteButton('page_skjemautfyller__deletebutton--margin-top')}
              {repeatButton}
            </div>
          ) : (
            <div>{repeatButton}</div>
          )}
          {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : null}
        </Collapse>
      </div>
    );
  }
}

export default layoutChange(DropdownView);
