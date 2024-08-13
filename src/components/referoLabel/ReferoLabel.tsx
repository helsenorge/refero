import { QuestionnaireItem } from 'fhir/r4';
import styles from './safetext.module.css';
import Label, { LabelText } from '@helsenorge/designsystem-react/components/Label';

import SafeText from './SafeText';
import SubLabel from './sublabel';
import { getLabelText, getSublabelText } from '@/util';
import { Resources } from '@/util/resources';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { useSelector } from 'react-redux';
import { GlobalState } from '@/reducers';
import { getFormDefinition } from '@/reducers/form';

type Props = {
  item: QuestionnaireItem;
  resources?: Resources;
  labelId: string;
  testId: string;
  labelText?: LabelText[];
  htmlFor?: string;
  sublabelId?: string;
  sublabelTestId?: string;
  afterLabelContent?: JSX.Element | null;
};

export const ReferoLabel = ({
  item,
  resources,
  labelId,
  labelText,
  htmlFor,
  testId,
  sublabelId,
  sublabelTestId,
  afterLabelContent,
}: Props): JSX.Element => {
  const formDefinition = useSelector((state: GlobalState) => getFormDefinition(state));
  const questionnaire = formDefinition?.Content;
  const { onRenderMarkdown } = useExternalRenderContext();
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
  const lblText = getLabelText(item, onRenderMarkdown, questionnaire, resources);
  return (
    <div style={{ alignItems: 'center' }}>
      <Label labelId={labelId} testId={testId} labelTexts={labelText || []} htmlFor={htmlFor} className={`page_refero__label`}>
        <div className={styles.label_content}>
          <SafeText text={lblText} />
          {/* <>{!isRequired(item) && <span>{'(Valgfritt)'}</span>}</> */}
          {subLabelText && <SubLabel id={sublabelId} testId={sublabelTestId} subLabelText={subLabelText} />}
          {afterLabelContent && afterLabelContent}
        </div>
      </Label>
    </div>
  );
};
