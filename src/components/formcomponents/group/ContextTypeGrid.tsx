import { getId } from '@/util';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import { RenderContext } from '@/util/renderContext';
import { getColumns } from './helpers';

import { RenderContextType } from '@/constants/renderContextType';
import { RenderItemProps } from '../renderChildren/RenderChildrenItems';
import { QuestionnaireItem } from 'fhir/r4';
import QuestionnaireItems from '@/components/QuestionnaireItems';

type ContextTypeGridProps = RenderItemProps;
type Props = {
  item: QuestionnaireItem;
  columns: string[];
};
const RenderHeaders = ({ item, columns }: Props): JSX.Element => {
  const headers = columns.map((c, i) => <th key={`${item.linkId}-${c}-${i}`}>{c}</th>);
  headers.unshift(<th key={`${item.linkId}-X`}>{item.text ? item.text : ''}</th>);
  return <>{headers}</>;
};

const ContextTypeGrid = (props: ContextTypeGridProps): JSX.Element => {
  const { item, index, path, id, onAnswerChange, responseItem, resources, responseItems } = props;
  const columns = getColumns(item);

  return (
    <>
      <table id={getId(id)} className="page_refero__grid">
        <thead>
          <tr>
            <RenderHeaders item={item} columns={columns} />
          </tr>
        </thead>
        <tbody>
          <QuestionnaireItems
            {...props}
            items={item.item}
            renderContext={new RenderContext(RenderContextType.Grid, item.linkId, columns)}
          />
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
