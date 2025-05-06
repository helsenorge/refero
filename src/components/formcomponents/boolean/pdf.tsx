import { ReactNode } from 'react';

import { QuestionnaireItem } from 'fhir/r4';

import { renderPrefix, getText } from '../../../util/index';

import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';

interface Props {
  item?: QuestionnaireItem;
  checked: boolean;
  children?: ReactNode;
}

const Pdf = ({ item, checked, children }: Props): JSX.Element => {
  const { onRenderMarkdown } = useExternalRenderContext();
  return (
    <div>
      {/* eslint-disable react/jsx-no-literals */}
      {checked ? (
        <b data-testid={`item_${item?.linkId}-pdf`}>[ X ]</b>
      ) : (
        <b data-testid={`item_${item?.linkId}-pdf`}>[&nbsp;&nbsp;&nbsp;&nbsp;]</b>
      )}{' '}
      {`${renderPrefix(item)} ${getText(item, onRenderMarkdown)}`}
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

export default Pdf;
