import * as React from 'react';
import { Collapse } from 'react-collapse';
import { RadioGroup, Options } from '@helsenorge/toolkit/components/atoms/radio-group';
import Validation from '@helsenorge/toolkit/components/molecules/form/validation';

import { isRequired, getId, renderPrefix, getText } from '../../../util/index';
import { Resources } from '../../../util/resources';
import { QuestionnaireItem } from '../../../types/fhir';

interface Props {
  options?: Array<Options>;
  item: QuestionnaireItem;
  id?: string;
  handleChange: (radioButton: string) => void;
  selected?: Array<string | undefined>;
  validateInput: (value: string) => boolean;
  resources?: Resources;
  getErrorMessage: (val: string) => string;
  renderDeleteButton: (className: string) => JSX.Element | undefined;
  repeatButton: JSX.Element;

  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
}

const RadioView: React.SFC<Props> = ({
  options,
  item,
  id,
  handleChange,
  selected,
  validateInput,
  children,
  getErrorMessage,
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
  return (
    <div className="page_skjemautfyller__component page_skjemautfyller__component_choice page_skjemautfyller__component_choice_radiobutton">
      <Collapse isOpened>
        <Validation {...other}>
          <RadioGroup
            legend={
              <span
                dangerouslySetInnerHTML={{
                  __html: `${renderPrefix(item)} ${getText(item, onRenderMarkdown)}`,
                }}
              />
            }
            id={getId(id)}
            options={options}
            onChange={handleChange}
            selected={selected ? selected[0] : undefined}
            isRequired={isRequired(item)}
            validator={validateInput}
            getErrorMessage={getErrorMessage}
            helpButton={renderHelpButton()}
            helpElement={renderHelpElement()}
            validateOnExternalUpdate={true}
            isStyleBlue
          />
        </Validation>
        {renderDeleteButton('page_skjemautfyller__deletebutton--margin-top')}
        {repeatButton}
        {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : undefined}
      </Collapse>
    </div>
  );
};

export default RadioView;
