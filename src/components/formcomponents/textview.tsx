import { type ReactNode, useState } from 'react';

import type { QuestionnaireItem } from 'fhir/r4';

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
  /** Leave out the title, for example in a table where the column header is the title. */
  hideTitle?: boolean;
}

const TextView = ({ id, testId, item, value, textClass, children, hideTitle }: Props): React.JSX.Element | null => {
  const { onRenderMarkdown } = useExternalRenderContext();
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  const safeTextId = `${getId(id)}-textview`;

  return (
    <div data-testid={testId} id={getId(id)}>
      {!hideTitle && (
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
      )}
      <div className={textClass || ''}>{value}</div>
      {children ? (
        <span>
          <br />
          {children}
        </span>
      ) : null}
      {!hideTitle && (
        <>
          <br />
          <br />
        </>
      )}
    </div>
  );
};

export default TextView;
