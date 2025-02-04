import { Dispatch } from 'react';

import { QuestionnaireItem } from 'fhir/r4';
import { useSelector } from 'react-redux';

import AnchorLink from '@helsenorge/designsystem-react/components/AnchorLink';

import GroupHeader from './GroupHeader';
import { getClassNames, getHeaderText } from './helpers';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';

import styles from './group.module.css';

import { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import { GlobalState } from '@/reducers';
import { getFormDefinition } from '@/reducers/form';
import { findQuestionnaireItem } from '@/reducers/selectors';
import { getId } from '@/util';

type DefaultGroup = QuestionnaireComponentItemProps & {
  isHelpVisible: boolean;
  setIsHelpVisible: Dispatch<React.SetStateAction<boolean>>;
};
const DefaultGroup = ({ isHelpVisible, setIsHelpVisible, children, ...rest }: DefaultGroup): JSX.Element => {
  const { headerTag, includeSkipLink, path, linkId, index, id } = rest;
  const { onRenderMarkdown, resources } = useExternalRenderContext();
  const item = useSelector<GlobalState, QuestionnaireItem | undefined>(state => findQuestionnaireItem(state, linkId));
  const formDefinition = useSelector((state: GlobalState) => getFormDefinition(state));
  const questionnaire = formDefinition?.Content;

  return (
    <section id={getId(id)} data-sectionname={getHeaderText(item, questionnaire, resources, onRenderMarkdown)}>
      {item?.repeats && path.length > 1 && index > 0 && <div data-testid="group-seperator" className="page__refero__group__seperator" />}

      <GroupHeader
        headerTag={headerTag}
        isHelpVisible={isHelpVisible}
        setIsHelpVisible={setIsHelpVisible}
        item={item}
        resources={resources}
      />
      {includeSkipLink && path?.length === 1 && (
        <AnchorLink className={`${styles.page_refero__skiplink} page_refero__skiplink`} href="#navigator-button">
          {resources?.skipLinkText}
        </AnchorLink>
      )}
      <div id={`${getId(id)}-navanchor`} className={getClassNames(item)}>
        {children}
      </div>

      <RenderDeleteButton item={item} path={path} index={index} className="page_refero__deletebutton--margin-top" />
      <RenderRepeatButton item={item} index={index} path={path} resources={resources} />
    </section>
  );
};
export default DefaultGroup;
