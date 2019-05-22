import * as React from 'react';
import { RadioGroup, Options } from '@helsenorge/toolkit/components/atoms/radio-group';
import { isRequired, getId, renderPrefix, getText } from '../../../util/index';
import { Collapse } from 'react-collapse';
import Validation from '@helsenorge/toolkit/components/molecules/form/validation';
import { Resources } from '../../../util/resources';
import { QuestionnaireItem } from '../../../types/fhir';
import { QuestionnaireResponseAnswer } from '../../../types/fhir';
import { shouldShowExtraChoice } from '../../../util/choice';

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
  renderOpenField: () => JSX.Element | undefined;
  repeatButton: JSX.Element;
  answer: Array<QuestionnaireResponseAnswer> | QuestionnaireResponseAnswer;

  renderHelpButton: () => JSX.Element;
  renderHelpElement: () => JSX.Element;
  helpElementIsVisible: boolean;
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
  renderOpenField,
  answer,
  renderHelpButton,
  renderHelpElement,
  helpElementIsVisible,
  ...other
}) => {
  if (!options) {
    return null;
  }
  return (
    <div className="page_skjemautfyller__component page_skjemautfyller__component_openchoice page_skjemautfyller__component_openchoice_radiobutton">
      <Collapse isOpened hasNestedCollapse={true}>
        <Validation {...other}>
          <RadioGroup
            legend={
              <span
                dangerouslySetInnerHTML={{
                  __html: `${renderPrefix(item)} ${getText(item)}`,
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
            isHelpVisible={helpElementIsVisible}
          />
        </Validation>
        {shouldShowExtraChoice(answer) ? (
          <div className="page_skjemautfyller__component_openchoice_openfield">{renderOpenField()}</div>
        ) : (
          <React.Fragment />
        )}
        {renderDeleteButton('page_skjemautfyller__deletebutton--margin-top')}
        {repeatButton}
        {children ? <div className="nested-fieldset nested-fieldset--full-height">{children}</div> : undefined}
      </Collapse>
    </div>
  );
};

export default RadioView;
