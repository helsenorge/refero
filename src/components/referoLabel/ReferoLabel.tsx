import { Questionnaire, QuestionnaireItem } from 'fhir/r4';

import Label, { LabelText } from '@helsenorge/designsystem-react/components/Label';

import SafeText from './SafeText';
import SubLabel from './sublabel';
import { getLabelText, getSublabelText } from '../../util';
import { Resources } from '../../util/resources';

type Props = {
  item: QuestionnaireItem;
  onRenderMarkdown?: (item: QuestionnaireItem, markdown: string) => string;
  questionnaire?: Questionnaire | null;
  resources?: Resources;
  labelId: string;
  testId: string;
  labelText?: LabelText[];
  renderHelpButton?: () => JSX.Element | undefined;
  htmlFor?: string;
  sublabelId?: string;
  sublabelTestId?: string;
};

export const ReferoLabel = ({
  item,
  onRenderMarkdown,
  questionnaire,
  resources,
  renderHelpButton,
  labelId,
  labelText,
  htmlFor,
  testId,
  sublabelId,
  sublabelTestId,
}: Props): JSX.Element => {
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
  const lblText = getLabelText(item, onRenderMarkdown, questionnaire, resources);
  return (
    <Label
      labelId={labelId}
      testId={testId}
      labelTexts={labelText || []}
      htmlFor={htmlFor}
      className="page_refero__label"
      afterLabelChildren={renderHelpButton && renderHelpButton()}
    >
      <div>
        <SafeText text={lblText} />
        {subLabelText && <SubLabel id={sublabelId} testId={sublabelTestId} subLabelText={subLabelText} />}
      </div>
    </Label>
  );
};
