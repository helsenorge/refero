import { Dispatch } from 'react';

import { Questionnaire, QuestionnaireItem } from 'fhir/r4';

import { getHeaderText } from './helpers';
import RenderHelpButton from '../help-button/RenderHelpButton';
import RenderHelpElement from '../help-button/RenderHelpElement';

import SafeText from '@/components/referoLabel/SafeText';
import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';
import { useAppSelector } from '@/reducers';
import { getFormDefinition } from '@/reducers/form';
import { getId, getText } from '@/util';
import { Resources } from '@/util/resources';

type GroupHeaderProps = {
  item?: QuestionnaireItem;
  questionnaire?: Questionnaire | null;
  resources?: Resources;
  headerTag?: number;
  isHelpVisible: boolean;
  setIsHelpVisible: Dispatch<React.SetStateAction<boolean>>;
};
const GroupHeader = ({ item, resources, headerTag, isHelpVisible, setIsHelpVisible }: GroupHeaderProps): JSX.Element | null => {
  const { onRenderMarkdown } = useExternalRenderContext();
  const formDefinition = useAppSelector(state => getFormDefinition(state));
  const questionnaire = formDefinition?.Content;
  if (!getText(item, onRenderMarkdown)) {
    return null;
  }

  const HeaderTag = `h${headerTag ?? 2}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  const headerText = getHeaderText(item, questionnaire, resources, onRenderMarkdown);
  const safeTextId = `${getId(item?.id)}-group-header`;
  return (
    <>
      <SafeText safeTextId={safeTextId} as={HeaderTag} text={headerText} className={'page_refero__heading'} />
      <RenderHelpButton
        isHelpVisible={isHelpVisible}
        item={item}
        setIsHelpVisible={setIsHelpVisible}
        padding={true}
        ariaLabeledBy={safeTextId}
      />
      <RenderHelpElement isHelpVisible={isHelpVisible} item={item} />
    </>
  );
};
export default GroupHeader;
