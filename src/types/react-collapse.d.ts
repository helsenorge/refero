declare namespace ReactCollapse {
  interface CollapseProps {
    isOpened?: boolean;
    className?: string;
    springConfig?: Array<Object>;
    onRest?: () => void;
    hasNestedCollapse?: boolean;
  }

  export class Collapse extends React.Component<CollapseProps, {}> {}
}

declare module 'react-collapse' {
  const collapse: typeof ReactCollapse.Collapse;
  export = collapse;
}
