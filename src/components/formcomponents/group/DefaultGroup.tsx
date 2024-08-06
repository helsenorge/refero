import { getId } from '@/util';
import RenderHelpElement from '../help-button/RenderHelpElement';
import GroupHeader from './GroupHeader';
import { getClassNames, getHeaderText } from './helpers';
import { RenderContext } from '@/util/renderContext';
import AnchorLink from '@helsenorge/designsystem-react/components/AnchorLink';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import { Questionnaire, QuestionnaireItem, QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { GlobalState } from '@/reducers';
import { Dispatch } from 'react';
import { Resources } from '@/util/resources';
import { Path } from '@/util/refero-core';
import { useExternalRenderContext } from '@/context/externalRenderContext';
import RenderRepeatButton from '../repeat/RenderRepeatButton';

type DefaultGroup = {
  id?: string;
  item: QuestionnaireItem;
  questionnaire?: Questionnaire | null;
  resources?: Resources;
  headerTag?: number;
  isHelpVisible: boolean;
  setIsHelpVisible: Dispatch<React.SetStateAction<boolean>>;
  includeSkipLink?: boolean;
  index?: number;
  path: Path[];
  onAnswerChange?: (newState: GlobalState, path: Path[], item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  renderChildrenItems: (renderContext: RenderContext) => Array<JSX.Element> | null;
  responseItem: QuestionnaireResponseItem;
  responseItems?: QuestionnaireResponseItem[];
};
const DefaultGroup = ({
  item,
  questionnaire,
  resources,
  id,
  headerTag,
  isHelpVisible,
  setIsHelpVisible,
  includeSkipLink,
  index,
  path,
  onAnswerChange,
  responseItem,
  responseItems,
  renderChildrenItems,
}: DefaultGroup): JSX.Element => {
  const { onRenderMarkdown } = useExternalRenderContext();
  return (
    <section id={getId(id)} data-sectionname={getHeaderText(item, questionnaire, resources, onRenderMarkdown)}>
      <GroupHeader
        headerTag={headerTag}
        isHelpVisible={isHelpVisible}
        setIsHelpVisible={setIsHelpVisible}
        item={item}
        questionnaire={questionnaire}
        resources={resources}
      />
      <RenderHelpElement item={item} isHelpVisible={isHelpVisible} />
      <div id={`${getId(id)}-navanchor`} className={getClassNames(item)}>
        {renderChildrenItems(new RenderContext())}
      </div>
      {includeSkipLink && path.length === 1 && (
        <AnchorLink className="page_refero__skiplink" href="#navigator-button">
          {resources?.skipLinkText}
        </AnchorLink>
      )}
      <RenderDeleteButton
        item={item}
        path={path}
        index={index}
        onAnswerChange={onAnswerChange}
        responseItem={responseItem}
        resources={resources}
        className="page_refero__deletebutton--margin-top"
      />
      <RenderRepeatButton
        item={item}
        index={index}
        path={path.slice(0, -1)}
        resources={resources}
        responseItem={responseItem}
        responseItems={responseItems}
      />
    </section>
  );
};
export default DefaultGroup;
