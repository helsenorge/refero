export interface TreeNode {
  nodeId: string;
  navn: string;
  type: NodeType;
  endepunkt: string | null;
  barn: Array<TreeNode>;
}

export enum NodeType {
  Region = 'region',
  Helseforetak = 'helseforetak',
  Sykehus = 'sykehus',
  Avdeling = 'avdeling',
}
