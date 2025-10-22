import { Coding } from 'fhir/r4';

type Props = {
  getIframeUrl: Coding;
};

export const Youtube = ({ getIframeUrl }: Props): React.JSX.Element | null => {
  return getIframeUrl ? (
    <iframe
      width="560"
      height="315"
      src={getIframeUrl?.display || ''}
      title="YouTube video player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    ></iframe>
  ) : null;
};
export default Youtube;
