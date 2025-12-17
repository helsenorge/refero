import type { ReactNode } from 'react';

type Props = {
  pdf: boolean;
  children: ReactNode;
};

const AsPdf = ({ pdf, children }: Props): JSX.Element => {
  return <>{pdf ? <div>{children}</div> : children}</>;
};
export default AsPdf;
