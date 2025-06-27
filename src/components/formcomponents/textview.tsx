import { ReactNode, useState } from 'react';

import { QuestionnaireItem } from 'fhir/r4';

import SafeText from '../referoLabel/SafeText';
import RenderHelpButton from './help-button/RenderHelpButton';
import RenderHelpElement from './help-button/RenderHelpElement';

import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';
import { getText, getId } from '@/util/index';

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

  const safeTextId = `${getId(id)}-textview`;

  console.log(getText(item, onRenderMarkdown));

  return (
    <div data-testid={testId} id={getId(id)}>
      <>
        <SafeText safeTextId={safeTextId} as="b" text={getText(item, onRenderMarkdown)} />

        <RenderHelpButton
          isHelpVisible={isHelpVisible}
          item={item}
          setIsHelpVisible={setIsHelpVisible}
          padding={true}
          ariaLabeledBy={safeTextId}
        />
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
