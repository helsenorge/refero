import { Resources } from '@/index';

type Props = {
  resources?: Resources;
  opening: boolean;
};

const HelpButton = ({ resources, opening }: Props): JSX.Element => {
  return (
    <button
      data-testid="help-button"
      type="button"
      title={resources ? resources?.helpButtonTooltip : 'Hjelp'}
      className="atom_inline-functionbutton"
      aria-expanded={opening}
    />
  );
};
export default HelpButton;
