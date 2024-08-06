import { getId } from '@/util';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import { RenderContext } from '@/util/renderContext';
import { getColumns } from './helpers';
import { QuestionnaireItem, QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { Path } from '@/util/refero-core';

import { GlobalState } from '@/reducers';
import { Resources } from '@/util/resources';
import { RenderContextType } from '@/constants/renderContextType';

type ContextTypeGridProps = {
  item: QuestionnaireItem;
  onAnswerChange?: (newState: GlobalState, path: Path[], item: QuestionnaireItem, answer: QuestionnaireResponseItemAnswer) => void;
  responseItem: QuestionnaireResponseItem;
  responseItems?: QuestionnaireResponseItem[];
  resources?: Resources;
  renderChildrenItems: (renderContext: RenderContext) => Array<JSX.Element> | null;
  index?: number;
  path: Path[];
  id?: string;
};
const ContextTypeGrid = ({
  item,
  renderChildrenItems,
  index,
  path,
  id,
  onAnswerChange,
  responseItem,
  resources,
  responseItems,
}: ContextTypeGridProps): JSX.Element => {
  const columns = getColumns(item);
  const headers = columns.map((c, i) => <th key={`${item.linkId}-${c}-${i}`}>{c}</th>);
  headers.unshift(<th key={`${item.linkId}-X`}>{item.text ? item.text : ''}</th>);

  const newRenderContext = new RenderContext(RenderContextType.Grid, item.linkId, columns);
  return (
    <>
      <table id={getId(id)} className="page_refero__grid">
        <thead>
          <tr>{headers}</tr>
        </thead>
        <tbody>{renderChildrenItems(newRenderContext)}</tbody>
      </table>
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
    </>
  );
};

export default ContextTypeGrid;
