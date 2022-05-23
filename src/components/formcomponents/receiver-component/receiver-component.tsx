import * as React from 'react';

import classNames from 'classnames';

import { Coding } from '../../../types/fhir';
import { EnhetType, OrgenhetHierarki } from '../../../types/orgenhetHierarki';

import Loader from '@helsenorge/designsystem-react/components/Loader';
import NotificationPanel from '@helsenorge/designsystem-react/components/NotificationPanel';

import ValidationError from '@helsenorge/form/components/form/validation-error';
import SafeSelect from '@helsenorge/form/components/safe-select';

import { getId } from '../../../util';
import { Resources } from '../../../util/resources';

export interface ReceiverComponentProps {
  selected?: Array<string | undefined>;
  id?: string;
  resources?: Resources;
  label?: string;
  fetchReceivers?: (successCallback: (receivers: Array<OrgenhetHierarki>) => void, errorCallback: () => void) => void;
  handleChange: (code?: string, systemArg?: string, displayArg?: string) => void;
  clearCodingAnswer: (coding: Coding) => void;
}

interface ReceiverComponentState {
  selectedPath: Array<number>;
  selectedReceiver: string;
  isValid: boolean;
  isValidated: boolean;
  receiverTreeNodes: Array<OrgenhetHierarki>;
  isLoading: boolean;
  hasLoadError: boolean;
}

class ReceiverComponent extends React.Component<ReceiverComponentProps, ReceiverComponentState> {
  constructor(props: ReceiverComponentProps) {
    super(props);

    this.state = {
      receiverTreeNodes: [],
      selectedPath: [],
      selectedReceiver: '',
      isValid: false,
      isValidated: false,
      isLoading: true,
      hasLoadError: false,
    };

    this.onChangeDropdownValue = this.onChangeDropdownValue.bind(this);
    this.loadSuccessCallback = this.loadSuccessCallback.bind(this);
    this.loadErrorCallback = this.loadErrorCallback.bind(this);
  }

  componentDidMount(): void {
    if (this.props.fetchReceivers) {
      this.props.fetchReceivers(this.loadSuccessCallback, this.loadErrorCallback);
    }
  }

  loadSuccessCallback(receivers: Array<OrgenhetHierarki>): void {
    const pathsToEndPoint = this.props.selected ? this.findPathToEndpointNode(receivers, this.props.selected[0] || '') : [];
    const selectedPath = pathsToEndPoint.length === 1 ? pathsToEndPoint[0] : [];
    const selectedReceiver = this.getReceiverName(receivers, selectedPath);

    this.setState({
      isLoading: false,
      receiverTreeNodes: receivers,
      selectedPath: selectedPath,
      selectedReceiver: selectedReceiver,
      isValid: !!selectedReceiver,
      hasLoadError: receivers.length === 0, // show error if there are no receivers
    });

    // clear answer if more than one receiver match the selected endpoint
    if (selectedPath.length === 0 && this.props.selected && this.props.selected.length > 0) {
      this.props.clearCodingAnswer({ code: this.props.selected[0] });
    }
  }

  loadErrorCallback(): void {
    this.setState({
      isLoading: false,
      hasLoadError: true,
    });
  }

  findPathToEndpointNode(
    nodes: Array<OrgenhetHierarki> | null,
    target: string,
    currentPath: Array<number> = [],
    finalPaths: Array<Array<number>> = []
  ): Array<Array<number>> {
    (nodes || []).forEach(node => {
      if (this.getEndepunktVerdi(node.EndepunktId) === target && (node.UnderOrgenheter === null || node.UnderOrgenheter.length === 0)) {
        finalPaths.push([...currentPath, node.OrgenhetId]);
      } else {
        this.findPathToEndpointNode(node.UnderOrgenheter, target, [...currentPath, node.OrgenhetId], finalPaths);
      }
    });

    return finalPaths;
  }

  onChangeDropdownValue(level: number, selectedNode: OrgenhetHierarki): void {
    const isLeafNode = selectedNode.UnderOrgenheter === null || selectedNode.UnderOrgenheter.length === 0;

    this.setState((prevState: ReceiverComponentState) => {
      const prevSelectedValues = prevState.selectedPath.filter((_x, index) => index < level);
      const newSelectedPath = [...prevSelectedValues, selectedNode.OrgenhetId];
      const selectedReceiver = isLeafNode ? this.getReceiverName(this.state.receiverTreeNodes, newSelectedPath) : '';
      return {
        selectedPath: newSelectedPath,
        selectedReceiver: selectedReceiver,
        isValid: !!selectedReceiver,
      };
    });

    if (isLeafNode) {
      // set answer selected when leaf node is selected
      this.props.handleChange(this.getEndepunktVerdi(selectedNode.EndepunktId) || '', '', selectedNode.Navn);
    } else if (this.props.selected) {
      // clear previous answer when another node than a leaf node is selected
      this.props.clearCodingAnswer({ code: this.props.selected[0] });
    }
  }

  findTreeNodeFromPath(searchData: Array<OrgenhetHierarki> | null, searchPath: Array<number>): OrgenhetHierarki | undefined {
    const currentSearchNode = (searchData || []).find(x => x.OrgenhetId === searchPath[0]);
    if (!currentSearchNode) {
      return undefined; // this should never happen
    }
    if (searchPath.length === 1) {
      return currentSearchNode;
    }
    const newSearchPath = [...searchPath];
    newSearchPath.shift();
    return this.findTreeNodeFromPath(currentSearchNode.UnderOrgenheter, newSearchPath);
  }

  getReceiverName(searchData: Array<OrgenhetHierarki>, searchPath: Array<number>): string {
    const receiverNodes = searchPath.map((_x, index) => {
      return this.findTreeNodeFromPath(searchData, searchPath.slice(0, index + 1));
    });
    // if a leaf node is the last selected node, a valid receiver is selected
    if (
      receiverNodes[receiverNodes.length - 1]?.UnderOrgenheter === null ||
      receiverNodes[receiverNodes.length - 1]?.UnderOrgenheter?.length === 0
    ) {
      return receiverNodes.map(receiverNode => receiverNode?.Navn).join(' / ');
    } else {
      return '';
    }
  }

  getEndepunktVerdi(endepunktId: string | null | undefined): string {
    return `Endpoint/${endepunktId}`;
  }

  // this function is called on form submit
  validateField(): Promise<void> {
    return new Promise<void>((resolve: () => void) => {
      this.setState(
        {
          isValid: !!this.getReceiverName(this.state.receiverTreeNodes, this.state.selectedPath),
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

  getLabelText(enhetType: EnhetType): string | undefined {
    if (enhetType === EnhetType.Region) {
      return this.props.resources?.adresseKomponent_velgHelseregion;
    } else if (enhetType === EnhetType.Foretak) {
      return this.props.resources?.adresseKomponent_velgHelseforetak;
    } else if (enhetType === EnhetType.Sykehus) {
      return this.props.resources?.adresseKomponent_velgSykehus;
    } else if (enhetType === EnhetType.Klinikk) {
      return this.props.resources?.adresseKomponent_velgKlinikk;
    } else if (enhetType === EnhetType.Avdeling) {
      return this.props.resources?.adresseKomponent_velgAvdeling;
    } else if (enhetType === EnhetType.Seksjon) {
      return this.props.resources?.adresseKomponent_velgSeksjon;
    } else if (enhetType === EnhetType.Sengepost) {
      return this.props.resources?.adresseKomponent_velgSengepost;
    } else if (enhetType === EnhetType.Poliklinikk) {
      return this.props.resources?.adresseKomponent_velgPoliklinikk;
    } else if (enhetType === EnhetType.Tjeneste) {
      return this.props.resources?.adresseKomponent_velgTjeneste;
    }
    return '';
  }

  createSelect(treeNodes: Array<OrgenhetHierarki>, level: number, selectKey: string): JSX.Element {
    const selectOptions = treeNodes.map(node => new Option(node.Navn, node.OrgenhetId.toString()));
    const label = this.getLabelText(treeNodes[0].EnhetType);

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
          const node = treeNodes.find(x => x.OrgenhetId === parseInt(newValue));
          if (node) {
            this.onChangeDropdownValue(level, node);
          }
        }}
        options={selectOptions}
        selected={this.state.selectedPath[level] ? this.state.selectedPath[level].toString() : ''}
        value={this.state.selectedPath[level] ? this.state.selectedPath[level].toString() : ''}
        placeholder={new Option(this.props.resources?.selectDefaultPlaceholder, '')}
        wrapperClasses="page_refero__receiverselect"
        className="page_refero__input"
      />
    );
  }

  renderSelects(): JSX.Element {
    const selectConfigs = [{ key: 'root', selectOptions: this.state.receiverTreeNodes }];
    this.state.selectedPath.forEach((_x, index) => {
      const searchPath = this.state.selectedPath.slice(0, index + 1);
      const treeNodes = this.findTreeNodeFromPath(this.state.receiverTreeNodes, searchPath)?.UnderOrgenheter;
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
      <div className={wrapperClasses} id={getId(this.props.id)}>
        {this.renderErrorMessage()}
        <h2>{this.props.resources?.adresseKomponent_header}</h2>
        <div className="page_refero__sublabel">{this.props.resources?.adresseKomponent_sublabel}</div>

        {this.state.isLoading && (
          <div>
            <Loader />
          </div>
        )}
        {this.state.hasLoadError && (
          <NotificationPanel variant="alert">{this.props.resources?.adresseKomponent_loadError}</NotificationPanel>
        )}

        {this.state.receiverTreeNodes.length > 0 && this.renderSelects()}
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
