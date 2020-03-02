import { RenderContextType } from '../constants/renderContextType';
import { QuestionnaireItem } from '../types/fhir';

export class RenderContext {
  public RenderContextType: RenderContextType;
  public Columns: string[];
  public Owner: string;
  public RenderChildren?: (
    children: QuestionnaireItem[],
    renderItem: (item: QuestionnaireItem, renderContext: RenderContext) => Array<JSX.Element | undefined>
  ) => JSX.Element[];

  constructor(renderContextType: RenderContextType = RenderContextType.None, owner: string = '', columns: string[] = []) {
    this.RenderContextType = renderContextType;
    this.Owner = owner;
    this.Columns = columns;
  }
}
