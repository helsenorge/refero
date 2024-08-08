import { QuestionnaireItem } from 'fhir/r4';

import { RenderContextType } from '../constants/renderContextType';

export class RenderContext {
  public RenderContextType: RenderContextType;
  public Columns: string[];
  public Owner: string;
  public RenderChildren?: (
    children: QuestionnaireItem[],
    renderItem: (item: QuestionnaireItem, renderContext: RenderContext) => JSX.Element | null
  ) => JSX.Element[];

  constructor(renderContextType: RenderContextType = RenderContextType.None, owner: string = '', columns: string[] = []) {
    this.RenderContextType = renderContextType;
    this.Owner = owner;
    this.Columns = columns;
  }
}
