import { getId } from '@/util';
import RenderHelpElement from '../help-button/RenderHelpElement';
import GroupHeader from './GroupHeader';
import { getClassNames, getHeaderText } from './helpers';
import AnchorLink from '@helsenorge/designsystem-react/components/AnchorLink';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import styles from './group.module.css';
import { Dispatch } from 'react';

import { useExternalRenderContext } from '@/context/externalRenderContext';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { useSelector } from 'react-redux';
import { GlobalState } from '@/reducers';
import { getFormDefinition } from '@/reducers/form';

type DefaultGroup = QuestionnaireComponentItemProps & {
  isHelpVisible: boolean;
  setIsHelpVisible: Dispatch<React.SetStateAction<boolean>>;
};
const DefaultGroup = ({ isHelpVisible, setIsHelpVisible, children, ...rest }: DefaultGroup): JSX.Element => {
  const { item, resources, headerTag, includeSkipLink, path, responseItem, index, id, responseItems } = rest;
  const { onRenderMarkdown } = useExternalRenderContext();
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
      <RenderHelpElement item={item} isHelpVisible={isHelpVisible} />
      {includeSkipLink && path?.length === 1 && (
        <AnchorLink className={`${styles.page_refero__skiplink} page_refero__skiplink`} href="#navigator-button">
          {resources?.skipLinkText}
        </AnchorLink>
      )}
      <div id={`${getId(id)}-navanchor`} className={getClassNames(item)}>
        {children}
      </div>

      <RenderDeleteButton
        item={item}
        path={path}
        index={index}
        responseItem={responseItem}
        className="page_refero__deletebutton--margin-top"
      />
      <RenderRepeatButton
        item={item}
        index={index}
        path={path?.slice(0, -1)}
        resources={resources}
        responseItem={responseItem}
        responseItems={responseItems}
      />
    </section>
  );
};
export default DefaultGroup;
