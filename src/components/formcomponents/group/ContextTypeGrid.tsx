import { getId } from '@/util';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import { RenderContext } from '@/util/renderContext';
import { getColumns } from './helpers';

import { RenderContextType } from '@/constants/renderContextType';
import { RenderChildrenItems, RenderItemProps } from '../renderChildren/RenderChildrenItems';

type ContextTypeGridProps = RenderItemProps;
const ContextTypeGrid = (props: ContextTypeGridProps): JSX.Element => {
  const { item, index, path, id, onAnswerChange, responseItem, resources, responseItems } = props;
  const columns = getColumns(item);
  const headers = [...columns]
    .map((c, i) => <th key={`${item.linkId}-${c}-${i}`}>{c}</th>)
    .unshift(<th key={`${item.linkId}-X`}>{item.text ? item.text : ''}</th>);

  const newRenderContext = new RenderContext(RenderContextType.Grid, item.linkId, columns);
  return (
    <>
      <table id={getId(id)} className="page_refero__grid">
        <thead>
          <tr>{headers}</tr>
        </thead>
        <tbody>
          <RenderChildrenItems otherProps={{ ...props, renderContext: newRenderContext }} />
        </tbody>
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
        path={path?.slice(0, -1)}
        resources={resources}
        responseItem={responseItem}
        responseItems={responseItems}
      />
    </>
  );
};

export default ContextTypeGrid;
