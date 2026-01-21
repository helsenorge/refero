import type React from 'react';

import type { QuestionnaireItem } from 'fhir/r4';

import { RenderContextType } from '../constants/renderContextType';

export class RenderContext {
  public RenderContextType: RenderContextType;
  public Columns: string[];
  public Owner: string;
  public RenderChildren?: (
    children: QuestionnaireItem[],
    renderItem: (item: QuestionnaireItem, renderContext: RenderContext) => React.JSX.Element | null
  ) => React.JSX.Element[];

  constructor(
    renderContextType: RenderContextType = RenderContextType.None,
    owner: string = '',
    columns: string[] = [],
    renderChildren?: (
      children: QuestionnaireItem[],
      renderItem: (item: QuestionnaireItem, renderContext: RenderContext) => React.JSX.Element | null
    ) => React.JSX.Element[]
  ) {
    this.RenderContextType = renderContextType;
    this.Owner = owner;
    this.Columns = columns;
    this.RenderChildren = renderChildren;
  }
}
