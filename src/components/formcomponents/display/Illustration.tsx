import HighlightPanel from '@helsenorge/designsystem-react/components/HighlightPanel';
import { IllustrationName } from '@helsenorge/designsystem-react/components/Illustrations/IllustrationNames';
import LazyIllustration from '@helsenorge/designsystem-react/components/LazyIllustration';

export const Illustration = ({ illustrationName }: { illustrationName: IllustrationName }): React.JSX.Element => {
  return (
    <HighlightPanel color="blueberry" variant="compact">
      <LazyIllustration color="neutral" illustrationName={illustrationName} />
    </HighlightPanel>
  );
};
