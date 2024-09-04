import { QuestionnaireItem } from 'fhir/r4';
import styles from './safetext.module.css';
import Label, { LabelText } from '@helsenorge/designsystem-react/components/Label';

import SafeText from './SafeText';
import SubLabel from './sublabel';
import { getLabelText, getSublabelText, isReadOnly, isRequired } from '@/util';
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
    <div style={{ alignItems: 'center' }} className={styles.label_content}>
      <Label
        labelId={labelId}
        testId={testId}
        labelTexts={labelText || []}
        htmlFor={htmlFor}
        className={`${styles.pageReferoLabel} page_refero__label`}
      >
        <div>
          <SafeText as="span" text={`${lblText}`} className={styles.referoLabelSafetext} />
          {!isRequired(item) && !isReadOnly(item) && <span className={styles.LabelOptionalText}>{' (Valgfritt)'}</span>}
        </div>
        {subLabelText && <SubLabel id={sublabelId} testId={sublabelTestId} subLabelText={subLabelText} />}
      </Label>
      {afterLabelContent ?? null}
    </div>
  );
};
