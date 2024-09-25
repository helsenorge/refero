import { getId } from '@/util';
import RenderDeleteButton from '../repeat/RenderDeleteButton';
import RenderRepeatButton from '../repeat/RenderRepeatButton';
import { RenderContext } from '@/util/renderContext';
import { getColumns } from './helpers';

import { RenderContextType } from '@/constants/renderContextType';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import GenerateQuestionnaireComponents, {
  QuestionnaireComponentItemProps,
} from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import { useExternalRenderContext } from '@/context/externalRenderContext';

type ContextTypeGridProps = QuestionnaireComponentItemProps & {
  item?: QuestionnaireItem;
  responseItem?: QuestionnaireResponseItem;
};
type Props = {
  item?: QuestionnaireItem;
  columns: string[];
};
const RenderHeaders = ({ item, columns }: Props): JSX.Element => {
  const headers = columns.map((c, i) => <th key={`${item?.linkId}-${c}-${i}`}>{c}</th>);
  headers.unshift(<th key={`${item?.linkId}-X`}>{item?.text ? item.text : ''}</th>);
  return <>{headers}</>;
};

const ContextTypeGrid = (props: ContextTypeGridProps): JSX.Element => {
  const { item, index, path, id, responseItem } = props;
  const columns = getColumns(item);
  const { resources } = useExternalRenderContext();
  return (
    <>
      <table id={getId(id)} className="page_refero__grid">
        <thead>
          <tr>
            <RenderHeaders item={item} columns={columns} />
          </tr>
        </thead>
        <tbody>
          <GenerateQuestionnaireComponents
            {...props}
            items={item?.item}
            renderContext={new RenderContext(RenderContextType.Grid, item?.linkId, columns)}
          />
        </tbody>
      </table>
      <RenderDeleteButton
        item={item}
        path={path}
        index={index}
        responseItem={responseItem}
        className="page_refero__deletebutton--margin-top"
      />
      <RenderRepeatButton item={item} index={index} path={path?.slice(0, -1)} resources={resources} responseItem={responseItem} />
    </>
  );
};

export default ContextTypeGrid;
