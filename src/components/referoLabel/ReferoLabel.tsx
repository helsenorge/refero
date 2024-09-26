import { QuestionnaireItem } from 'fhir/r4';
import styles from './referoLabel.module.css';
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
  dateLabel?: string;
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
  dateLabel,
}: Props): JSX.Element => {
  const formDefinition = useSelector((state: GlobalState) => getFormDefinition(state));
  const questionnaire = formDefinition?.Content;
  const { onRenderMarkdown } = useExternalRenderContext();
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
  const lblText = getLabelText(item, onRenderMarkdown, questionnaire, resources);
  return (
    <div className={`${styles.labelWithHelp} labelWithHelp`}>
      <div className={styles.label_content}>
        <Label
          labelId={labelId}
          testId={testId}
          labelTexts={labelText || []}
          htmlFor={htmlFor}
          className={`${styles.pageReferoLabel} page_refero__label`}
        >
          <div className={`${styles.textOptionalWrapper}`}>
            <SafeText as="span" text={`${lblText}`} className={`${styles.referoLabelSafetext} referoLabelSafetext`} />
            {!isRequired(item) && !isReadOnly(item) ? (
              <span
                className={`${styles.LabelOptionalText} LabelOptionalText`}
              >{` ${dateLabel && dateLabel + ' '}${resources?.formOptional || ` (Valgfritt)`}`}</span>
            ) : (
              <span className={`${styles.LabelOptionalText} LabelOptionalText`}>{` ${dateLabel && dateLabel}`}</span>
            )}
          </div>
        </Label>
        {afterLabelContent ?? null}
      </div>
      {subLabelText && <SubLabel id={sublabelId} testId={sublabelTestId} subLabelText={subLabelText} />}
    </div>
  );
};
