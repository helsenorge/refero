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
import RenderHelpButton from '../formcomponents/help-button/RenderHelpButton';
import { useState } from 'react';
import RenderHelpElement from '../formcomponents/help-button/RenderHelpElement';
import { getMarkdownExtensionValue } from '@/util/extension';

type Props = {
  item?: QuestionnaireItem;
  resources?: Resources;
  labelId: string;
  testId: string;
  labelText?: LabelText[];
  htmlFor?: string;
  sublabelId?: string;
  sublabelTestId?: string;
  dateLabel?: string;
  attachmentLabel?: string;
  afterLabelChildren?: JSX.Element | null;
  children?: React.ReactNode;
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
  dateLabel,
  attachmentLabel,
  afterLabelChildren,
  children,
}: Props): JSX.Element => {
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const questionnaire = useSelector((state: GlobalState) => getFormDefinition(state))?.Content;
  const { onRenderMarkdown } = useExternalRenderContext();
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
  const lblText = getLabelText(item, onRenderMarkdown, questionnaire, resources);

  return (
    <>
      <div className={styles.referoLabel_label_wrapper}>
        <div>
          <Label
            labelId={labelId}
            testId={testId}
            labelTexts={labelText || []}
            htmlFor={htmlFor}
            className={styles.pageReferoLabel}
            afterLabelChildren={afterLabelChildren}
          >
            <SafeText as="span" text={lblText} className={styles.referoLabel_safetext}></SafeText>
          </Label>
        </div>
        <div className={styles.referoLabel_extraLabel_and_helpButton_wrapper}>
          {!isRequired(item) && !isReadOnly(item) ? (
            <span className={styles.referoLabel_extraLabel}>{`${dateLabel || ''} ${resources?.formOptional || `(valgfritt)`}`}</span>
          ) : (
            dateLabel && <span className={styles.referoLabel_extraLabel}>{dateLabel}</span>
          )}
          <RenderHelpButton item={item} setIsHelpVisible={setIsHelpVisible} isHelpVisible={isHelpVisible} />
        </div>
      </div>
      {children}
      {subLabelText && <SubLabel id={sublabelId} testId={sublabelTestId} subLabelText={subLabelText} />}
      {attachmentLabel && <SubLabel id={sublabelId} testId={sublabelTestId} subLabelText={attachmentLabel} />}
      <RenderHelpElement isHelpVisible={isHelpVisible} item={item} />
    </>
  );
};
