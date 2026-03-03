import { useState } from 'react';

import type { Resources } from '@/util/resources';
import type { QuestionnaireItem } from 'fhir/r4';

import FormFieldTag from '@helsenorge/designsystem-react/components/FormFieldTag';
import Label, { type LabelText } from '@helsenorge/designsystem-react/components/Label';

import SafeText from './SafeText';
import SubLabel from './sublabel';
import RenderHelpButton from '../formcomponents/help-button/RenderHelpButton';
import RenderHelpElement from '../formcomponents/help-button/RenderHelpElement';

import styles from './referoLabel.module.css';

import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';
import { useAppSelector } from '@/reducers';
import { getFormDefinition } from '@/reducers/form';
import { RequiredLevelSelector } from '@/reducers/selectors';
import { getId, getLabelText, getSublabelText } from '@/util';

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
  afterLabelChildren?: React.JSX.Element | null;
  children?: React.ReactNode;
  formFieldTagId: string;
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
  formFieldTagId,
}: Props): React.JSX.Element => {
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const questionnaire = useAppSelector(state => getFormDefinition(state))?.Content;

  const { onRenderMarkdown } = useExternalRenderContext();
  const subLabelText = getSublabelText(item, onRenderMarkdown, questionnaire, resources);
  const lblText = labelText ? labelText : getLabelText(item, onRenderMarkdown, questionnaire, resources);
  const id = getId(item?.id);
  const { level, errorLevelResources } = useAppSelector(state => RequiredLevelSelector(state, item, resources));

  return (
    <>
      <div className={styles.referoLabel_label_wrapper}>
        <div>
          <Label
            formFieldTag={level ? <FormFieldTag id={formFieldTagId} level={level} resources={errorLevelResources} /> : null}
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
          {dateLabel && <span className={styles.referoLabel_extraLabel}>{dateLabel}</span>}
          <div className={styles.referoLabel_helpButton}>
            <RenderHelpButton item={item} setIsHelpVisible={setIsHelpVisible} isHelpVisible={isHelpVisible} ariaLabeledBy={labelId} />
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
