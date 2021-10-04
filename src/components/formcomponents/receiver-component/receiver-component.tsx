import * as React from 'react';

import classNames from 'classnames';

import { Coding } from '../../../types/fhir';
import { NodeType, TreeNode } from '../../../types/receiverTreeNode';

import SafeSelect from '@helsenorge/toolkit/components/atoms/safe-select';
import ValidationError from '@helsenorge/toolkit/components/molecules/form/validation-error';

import { getId } from '../../../util';
import { Resources } from '../../../util/resources';

export interface ReceiverComponentProps {
  selected?: Array<string | undefined>;
  id?: string;
  resources?: Resources;
  receiverTreeNodes: Array<TreeNode>;
  label?: string;
  handleChange: (code?: string, systemArg?: string, displayArg?: string) => void;
  clearCodingAnswer: (coding: Coding) => void;
}

interface ReceiverComponentState {
  selectedPath: Array<string>;
  selectedReceiver: string;
  isValid: boolean;
  isValidated: boolean;
}

class ReceiverComponent extends React.Component<ReceiverComponentProps, ReceiverComponentState> {
  constructor(props: ReceiverComponentProps) {
    super(props);

    const selectedPath = this.props.selected ? this.findPathToEndpointNode(this.props.receiverTreeNodes, this.props.selected[0] || '') : [];
    const selectedReceiver = this.getReceiverName(this.props.receiverTreeNodes, selectedPath);

    this.state = {
      selectedPath: selectedPath,
      selectedReceiver: selectedReceiver,
      isValid: !!selectedReceiver,
      isValidated: false,
    };

    this.onChangeDropdownValue = this.onChangeDropdownValue.bind(this);
  }

  findPathToEndpointNode(
    nodes: Array<TreeNode>,
    target: string,
    currentPath: Array<string> = [],
    finalPath: Array<string> = []
  ): Array<string> {
    nodes.forEach(node => {
      if (node.endepunkt === target && finalPath.length === 0) {
        finalPath.push(...currentPath, node.nodeId);
      } else {
        this.findPathToEndpointNode(node.barn, target, [...currentPath, node.nodeId], finalPath);
      }
    });

    return finalPath;
  }

  onChangeDropdownValue(level: number, selectedNode: TreeNode): void {
    const isLeafNode = selectedNode.barn.length === 0;

    this.setState((prevState: ReceiverComponentState) => {
      const prevSelectedValues = prevState.selectedPath.filter((_x, index) => index < level);
      const newSelectedPath = [...prevSelectedValues, selectedNode.nodeId];
      const selectedReceiver = isLeafNode ? this.getReceiverName(this.props.receiverTreeNodes, newSelectedPath) : '';
      return {
        selectedPath: newSelectedPath,
        selectedReceiver: selectedReceiver,
        isValid: !!selectedReceiver,
      };
    });

    if (isLeafNode) {
      // set answer selected when leaf node is selected
      this.props.handleChange(selectedNode.endepunkt || '', '', selectedNode.navn);
    } else if (this.props.selected) {
      // clear previous answer when another node than a leaf node is selected
      this.props.clearCodingAnswer({ code: this.props.selected[0] });
    }
  }

  findTreeNodeFromPath(searchData: Array<TreeNode>, searchPath: Array<string>): TreeNode | undefined {
    const currentSearchNode = searchData.find(x => x.nodeId === searchPath[0]);
    if (!currentSearchNode) {
      return undefined; // this should never happen
    }
    if (searchPath.length === 1) {
      return currentSearchNode;
    }
    const newSearchPath = [...searchPath];
    newSearchPath.shift();
    return this.findTreeNodeFromPath(currentSearchNode.barn, newSearchPath);
  }

  getReceiverName(searchData: Array<TreeNode>, searchPath: Array<string>): string {
    const receiverNodes = searchPath.map((_x, index) => {
      return this.findTreeNodeFromPath(searchData, searchPath.slice(0, index + 1));
    });
    // if a leaf node the last selected node, a valid receiver is selected
    if (receiverNodes[receiverNodes.length - 1]?.barn.length !== 0) {
      return '';
    } else {
      return receiverNodes.map(receiverNode => receiverNode?.navn).join(' / ');
    }
  }

  // this function is called on form submit
  validateField(): Promise<void> {
    return new Promise<void>((resolve: () => void) => {
      this.setState(
        {
          isValid: !!this.getReceiverName(this.props.receiverTreeNodes, this.state.selectedPath),
          isValidated: true,
        },
        () => {
          resolve();
        }
      );
    });
  }

  // this function is used to get validation state for validation summary component
  isValid(): boolean {
    return this.state.isValid;
  }

  getLabelText(nodeType: NodeType): string | undefined {
    if (nodeType === NodeType.Region) {
      return this.props.resources?.adresseKomponent_velgHelseregion;
    } else if (nodeType === NodeType.Helseforetak) {
      return this.props.resources?.adresseKomponent_velgHelseforetak;
    } else if (nodeType === NodeType.Sykehus) {
      return this.props.resources?.adresseKomponent_velgSykehus;
    } else if (nodeType === NodeType.Avdeling) {
      return this.props.resources?.adresseKomponent_velgAvdeling;
    }
    return '';
  }

  createSelect(treeNodes: Array<TreeNode>, level: number, selectKey: string): JSX.Element {
    const selectOptions = treeNodes.map(node => new Option(node.navn, node.nodeId));
    const label = this.getLabelText(treeNodes[0].type);

    return (
      <SafeSelect
        key={selectKey}
        id={`${getId(this.props.id)}-${selectKey}`}
        selectName={`${getId(this.props.id)}-${selectKey}`}
        showLabel={true}
        label={label}
        isRequired={true}
        onChange={(evt): void => {
          const newValue = (evt.target as HTMLInputElement).value;
          const node = treeNodes.find(x => x.nodeId === newValue);
          if (node) {
            this.onChangeDropdownValue(level, node);
          }
        }}
        options={selectOptions}
        selected={this.state.selectedPath[level] || ''}
        value={this.state.selectedPath[level] || ''}
        placeholder={new Option(this.props.resources?.selectDefaultPlaceholder, '')}
        wrapperClasses="page_skjemautfyller__receiverselect"
        className="page_skjemautfyller__input"
      />
    );
  }

  renderSelects(): JSX.Element {
    const selectConfigs = [{ key: 'root', selectOptions: this.props.receiverTreeNodes }];
    this.state.selectedPath.forEach((_x, index) => {
      const searchPath = this.state.selectedPath.slice(0, index + 1);
      const treeNodes = this.findTreeNodeFromPath(this.props.receiverTreeNodes, searchPath)?.barn;
      if (treeNodes && treeNodes.length > 0) {
        return selectConfigs.push({ key: searchPath.toString(), selectOptions: treeNodes });
      }
    });

    return (
      <>
        {selectConfigs.map((config, index) => {
          return this.createSelect(config.selectOptions, index, config.key);
        })}
      </>
    );
  }

  renderErrorMessage(): JSX.Element | null {
    if (!this.state.isValid && this.state.isValidated) {
      return <ValidationError isValid={this.state.isValid} error={this.props.resources?.adresseKomponent_feilmelding || ''} />;
    }
    return null;
  }

  render(): JSX.Element {
    const wrapperClasses = classNames({
      mol_validation: true,
      'mol_validation--active': !this.state.isValid && this.state.isValidated,
    });
    return (
      <div className={wrapperClasses} id={`${this.props.id}-wrapper`}>
        {this.renderErrorMessage()}
        <h2>{this.props.resources?.adresseKomponent_header}</h2>
        <div className="page_skjemautfyller__sublabel">{this.props.resources?.adresseKomponent_sublabel}</div>

        {this.renderSelects()}
        {this.state.selectedReceiver && (
          <div>
            <span>{`${this.props.resources?.adresseKomponent_skjemaSendesTil} `}</span>
            <strong>{this.state.selectedReceiver}</strong>
          </div>
        )}
      </div>
    );
  }
}

export default ReceiverComponent;
