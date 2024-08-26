import SafeText from '@/components/referoLabel/SafeText';
import RenderHelpButton from '../help-button/RenderHelpButton';
import { getHeaderText } from './helpers';
import { getText } from '@/util';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { Questionnaire, QuestionnaireItem } from 'fhir/r4';
import { Resources } from '@/util/resources';
import { Dispatch } from 'react';
import { useSelector } from 'react-redux';
import { getFormDefinition } from '@/reducers/form';
import { GlobalState } from '@/reducers';

type GroupHeaderProps = {
  item: QuestionnaireItem;
  questionnaire?: Questionnaire | null;
  resources?: Resources;
  headerTag?: number;
  isHelpVisible: boolean;
  setIsHelpVisible: Dispatch<React.SetStateAction<boolean>>;
};
const GroupHeader = ({ item, resources, headerTag, isHelpVisible, setIsHelpVisible }: GroupHeaderProps): JSX.Element | null => {
  const { onRenderMarkdown } = useExternalRenderContext();
  const formDefinition = useSelector((state: GlobalState) => getFormDefinition(state));
  const questionnaire = formDefinition?.Content;
  if (!getText(item, onRenderMarkdown)) {
    return null;
  }

  const HeaderTag = `h${headerTag}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  const headerText = getHeaderText(item, questionnaire, resources, onRenderMarkdown);
  return (
    <>
      <SafeText as={HeaderTag} text={headerText} className={'page_refero__heading'} />
      <RenderHelpButton isHelpVisible={isHelpVisible} item={item} setIsHelpVisible={setIsHelpVisible} />
    </>
  );
};
export default GroupHeader;