import { useState } from 'react';

import { QuestionnaireItem } from 'fhir/r4';

import Label, { LabelText } from '@helsenorge/designsystem-react/components/Label';

import SafeText from './SafeText';
import SubLabel from './sublabel';
import RenderHelpButton from '../formcomponents/help-button/RenderHelpButton';
import RenderHelpElement from '../formcomponents/help-button/RenderHelpElement';

import styles from './referoLabel.module.css';

import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';
import { useAppSelector } from '@/reducers';
import { getFormDefinition } from '@/reducers/form';
import { getId, getLabelText, getSublabelText, isReadOnly, isRequired } from '@/util';
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
  quantityUnitSubLabel?: string;
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
  quantityUnitSubLabel,
  afterLabelChildren,
  children,
}: Props): JSX.Element => {
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const questionnaire = useAppSelector(state => getFormDefinition(state))?.Content;
  const { onRenderMarkdown } = useExternalRenderContext();
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
  const lblText = labelText ? labelText : getLabelText(item, onRenderMarkdown, questionnaire, resources);
  const id = getId(item?.id);

  return (
    <>
      <div className={styles.referoLabel_label_wrapper}>
        <div>
          <Label
            labelId={labelId}
            testId={testId}
            labelTexts={
              labelTexts || [
                {
                  text: '',
                  type: 'subdued',
                },
              ]
            }
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
      {attachmentLabel && <SubLabel subLabelText={attachmentLabel} testId={`${id}-attachment-sublabel`} />}
      {quantityUnitSubLabel && <SubLabel subLabelText={quantityUnitSubLabel} testId={`${id}-quantity-unit-sublabel`} />}
      <RenderHelpElement isHelpVisible={isHelpVisible} item={item} />
    </>
  );
};
