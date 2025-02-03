import { useState } from 'react';

import { QuestionnaireItem } from 'fhir/r4';
import { useSelector } from 'react-redux';

import Label, { LabelText } from '@helsenorge/designsystem-react/components/Label';

import SafeText from './SafeText';
import SubLabel from './sublabel';
import RenderHelpButton from '../formcomponents/help-button/RenderHelpButton';
import RenderHelpElement from '../formcomponents/help-button/RenderHelpElement';

import styles from './referoLabel.module.css';


import { useExternalRenderContext } from '@/context/externalRenderContext';
import { GlobalState } from '@/reducers';
import { getFormDefinition } from '@/reducers/form';
import { getLabelText, getSublabelText, isReadOnly, isRequired } from '@/util';
import { Resources } from '@/util/resources';



type Props = {
  item?: QuestionnaireItem;
  resources?: Resources;
  labelId: string;
  testId: string;
  labelTexts?: LabelText[];
  labelText?: string;
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
  labelTexts,
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
  const lblText = labelText ? labelText : getLabelText(item, onRenderMarkdown, questionnaire, resources);

  return (
    <>
      <div className={styles.referoLabel_label_wrapper}>
        <div>
          <Label
            labelId={labelId}
            testId={testId}
            labelTexts={labelTexts || []}
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
          <div className={styles.referoLabel_helpButton}>
            <RenderHelpButton item={item} setIsHelpVisible={setIsHelpVisible} isHelpVisible={isHelpVisible} />
          </div>
        </div>
      </div>
      {children}
      {subLabelText && <SubLabel id={sublabelId} testId={sublabelTestId} subLabelText={subLabelText} />}
      {attachmentLabel && <SubLabel id={sublabelId} testId={sublabelTestId} subLabelText={attachmentLabel} />}
      <RenderHelpElement isHelpVisible={isHelpVisible} item={item} />
    </>
  );
};
