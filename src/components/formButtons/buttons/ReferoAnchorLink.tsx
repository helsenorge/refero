import AnchorLink, { AnchorLinkTargets } from '@helsenorge/designsystem-react/components/AnchorLink';

import { SanitizeText } from '@/util/sanitize/domPurifyHelper';

type Props = {
  text?: string;
  href?: string;
  disabled?: boolean;
  target?: AnchorLinkTargets;
  children?: React.ReactNode;
};
export const ReferoAnchorLink = ({ text, href, disabled, target, children }: Props): JSX.Element => {
  return (
    <>
      <AnchorLink target={target ? target : '_blank'} href={disabled || !href ? '' : SanitizeText(href).toString()}>
        {text ?? ''}
      </AnchorLink>
      {children}
    </>
  );
};
