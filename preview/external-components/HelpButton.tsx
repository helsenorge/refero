type Props = {
  opening: boolean;
};

const HelpButton = ({ opening }: Props): JSX.Element => {
  return <button data-testid="help-button" type="button" title={'Hjelp'} className="atom_inline-functionbutton" aria-expanded={opening} />;
};
export default HelpButton;
