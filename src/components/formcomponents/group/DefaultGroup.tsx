import { getId } from '@/util';
import GroupHeader from './GroupHeader';
import { getClassNames, getHeaderText } from './helpers';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import { Dispatch } from 'react';

import { useExternalRenderContext } from '@/context/externalRenderContext';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { useSelector } from 'react-redux';
import { GlobalState } from '@/reducers';
import { getFormDefinition } from '@/reducers/form';
import { QuestionnaireItem } from 'fhir/r4';
import { findQuestionnaireItem } from '@/reducers/selectors';

type DefaultGroup = QuestionnaireComponentItemProps & {
  isHelpVisible: boolean;
  setIsHelpVisible: Dispatch<React.SetStateAction<boolean>>;
};
const DefaultGroup = ({ isHelpVisible, setIsHelpVisible, children, ...rest }: DefaultGroup): JSX.Element => {
  const { headerTag, path, linkId, index, id } = rest;

  const item = useSelector<GlobalState, QuestionnaireItem | undefined>(state => findQuestionnaireItem(state, linkId));

  const { onRenderMarkdown, resources } = useExternalRenderContext();
  const formDefinition = useSelector((state: GlobalState) => getFormDefinition(state));
  const questionnaire = formDefinition?.Content;

  return (
    <section id={getId(id)} data-sectionname={getHeaderText(item, questionnaire, resources, onRenderMarkdown)}>
      <GroupHeader
        headerTag={headerTag}
        isHelpVisible={isHelpVisible}
        setIsHelpVisible={setIsHelpVisible}
        item={item}
        resources={resources}
      />
      <div id={`${getId(id)}-navanchor`} className={getClassNames(item)}>
        {children}
      </div>

      <RenderDeleteButton item={item} path={path} index={index} className="page_refero__deletebutton--margin-top" />
      <RenderRepeatButton item={item} index={index} path={path} resources={resources} />
    </section>
  );
};
export default DefaultGroup;
