import { ReactNode, useState } from 'react';

import { QuestionnaireItem } from 'fhir/r4';

import { getText, getId } from '@/util/index';
import SafeText from '../referoLabel/SafeText';
import RenderHelpButton from './help-button/RenderHelpButton';
import RenderHelpElement from './help-button/RenderHelpElement';
import { useExternalRenderContext } from '@/context/externalRenderContext';

interface Props {
  id?: string;
  testId?: string;
  item?: QuestionnaireItem;
  value?: string | number;
  textClass?: string;
  children?: ReactNode;
}

const TextView = ({ id, testId, item, value, textClass, children }: Props): JSX.Element | null => {
  const { onRenderMarkdown } = useExternalRenderContext();
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  return (
    <div data-testid={testId} id={getId(id)}>
      <>
        <SafeText as="b" text={getText(item, onRenderMarkdown)} />

        <RenderHelpButton isHelpVisible={isHelpVisible} item={item} setIsHelpVisible={setIsHelpVisible} padding={true} />
        <RenderHelpElement isHelpVisible={isHelpVisible} item={item} />
      </>
      <div className={textClass || ''}>{value}</div>
      {children ? (
        <span>
          <br />
          {children}
        </span>
      ) : null}
      <br />
      <br />
    </div>
  );
};

export default TextView;
