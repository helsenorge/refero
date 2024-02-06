import * as React from 'react';

import classNames from 'classnames';
import { useFormContext } from 'react-hook-form';

import { Coding } from '../../../types/fhir';
import { EnhetType, OrgenhetHierarki } from '../../../types/orgenhetHierarki';
import { Resources } from '../../../types/resources';

import Label from '@helsenorge/designsystem-react/components/Label';
import Loader from '@helsenorge/designsystem-react/components/Loader';
import NotificationPanel from '@helsenorge/designsystem-react/components/NotificationPanel';
import Select from '@helsenorge/designsystem-react/components/Select';

// import ValidationError from '@helsenorge/form/components/form/validation-error';

import { getId } from '../../../util';

export interface ReceiverComponentProps {
  selected?: Array<string | undefined>;
  id?: string;
  resources?: Resources;
  label?: string;
  fetchReceivers?: (successCallback: (receivers: Array<OrgenhetHierarki>) => void, errorCallback: () => void) => void;
  handleChange: (code?: string, systemArg?: string, displayArg?: string) => void;
  clearCodingAnswer: (coding: Coding) => void;
}

const ReceiverComponent: React.FC<ReceiverComponentProps> = props => {
  const [selectedPath, setSelectedPath] = React.useState<number[]>([]);
  const [selectedReceiver, setSelectedReceiver] = React.useState<string>('');
  const [isValid, setIsValid] = React.useState<boolean>(false);
  const [isValidated, setIsValidated] = React.useState<boolean>(false);
  const [receiverTreeNodes, setReceiverTreeNodes] = React.useState<Array<OrgenhetHierarki>>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [hasLoadError, setHasLoadError] = React.useState<boolean>(false);
  const { register } = useFormContext();
  const safeId = getId(props.id);

  React.useEffect(() => {
    if (props.fetchReceivers) {
      props.fetchReceivers(loadSuccessCallback, loadErrorCallback);
    }
  }, []);

  const loadSuccessCallback = (receivers: Array<OrgenhetHierarki>): void => {
    const pathsToEndPoint = props.selected ? findPathToEndpointNode(receivers, props.selected[0] || '') : [];
    const selectedPath = pathsToEndPoint.length === 1 ? pathsToEndPoint[0] : [];
    const selectedReceiver = getReceiverName(receivers, selectedPath);

    setSelectedPath(selectedPath);
    setSelectedReceiver(selectedReceiver);
    setIsValid(!!selectedReceiver);
    setReceiverTreeNodes(receivers);
    setIsLoading(false);
    setHasLoadError(receivers.length === 0);

    // clear answer if more than one receiver match the selected endpoint
    if (selectedPath.length === 0 && props.selected && props.selected.length > 0) {
      props.clearCodingAnswer({ code: props.selected[0] });
    }
  };

  const loadErrorCallback = (): void => {
    setIsLoading(false);
    setHasLoadError(true);
  };

  const findPathToEndpointNode = (
    nodes: Array<OrgenhetHierarki> | null,
    target: string,
    currentPath: Array<number> = [],
    finalPaths: Array<Array<number>> = []
  ): Array<Array<number>> => {
    (nodes || []).forEach(node => {
      if (getEndepunktVerdi(node.EndepunktId) === target && (node.UnderOrgenheter === null || node.UnderOrgenheter.length === 0)) {
        finalPaths.push([...currentPath, node.OrgenhetId]);
      } else {
        findPathToEndpointNode(node.UnderOrgenheter, target, [...currentPath, node.OrgenhetId], finalPaths);
      }
    });

    return finalPaths;
  };

  const onChangeDropdownValue = (level: number, selectedNode: OrgenhetHierarki): void => {
    const isLeafNode = selectedNode.UnderOrgenheter === null || selectedNode.UnderOrgenheter.length === 0;

    const prevSelectedValues = selectedPath.filter((_x, index) => index < level);
    const newSelectedPath = [...prevSelectedValues, selectedNode.OrgenhetId];
    const selectedReceiver = isLeafNode ? getReceiverName(receiverTreeNodes, newSelectedPath) : '';

    setSelectedPath(newSelectedPath);
    setSelectedReceiver(selectedReceiver);
    setIsValid(!!selectedReceiver);

    if (isLeafNode) {
      // set answer selected when leaf node is selected
      props.handleChange(getEndepunktVerdi(selectedNode.EndepunktId) || '', '', selectedNode.Navn);
    } else if (props.selected) {
      // clear previous answer when another node than a leaf node is selected
      props.clearCodingAnswer({ code: props.selected[0] });
    }
  };

  const findTreeNodeFromPath = (searchData: Array<OrgenhetHierarki> | null, searchPath: Array<number>): OrgenhetHierarki | undefined => {
    const currentSearchNode = (searchData || []).find(x => x.OrgenhetId === searchPath[0]);
    if (!currentSearchNode) {
      return undefined; // this should never happen
    }
    if (searchPath.length === 1) {
      return currentSearchNode;
    }
    const newSearchPath = [...searchPath];
    newSearchPath.shift();
    return findTreeNodeFromPath(currentSearchNode.UnderOrgenheter, newSearchPath);
  };

  const getReceiverName = (searchData: Array<OrgenhetHierarki>, searchPath: Array<number>): string => {
    const receiverNodes = searchPath.map((_x, index) => {
      return findTreeNodeFromPath(searchData, searchPath.slice(0, index + 1));
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
  };

  const getEndepunktVerdi = (endepunktId: string | null | undefined): string => {
    return `Endpoint/${endepunktId}`;
  };

  const getLabelText = (enhetType: EnhetType): string | undefined => {
    if (enhetType === EnhetType.Region) {
      return props.resources?.adresseKomponent_velgHelseregion;
    } else if (enhetType === EnhetType.Foretak) {
      return props.resources?.adresseKomponent_velgHelseforetak;
    } else if (enhetType === EnhetType.Sykehus) {
      return props.resources?.adresseKomponent_velgSykehus;
    } else if (enhetType === EnhetType.Klinikk) {
      return props.resources?.adresseKomponent_velgKlinikk;
    } else if (enhetType === EnhetType.Avdeling) {
      return props.resources?.adresseKomponent_velgAvdeling;
    } else if (enhetType === EnhetType.Seksjon) {
      return props.resources?.adresseKomponent_velgSeksjon;
    } else if (enhetType === EnhetType.Sengepost) {
      return props.resources?.adresseKomponent_velgSengepost;
    } else if (enhetType === EnhetType.Poliklinikk) {
      return props.resources?.adresseKomponent_velgPoliklinikk;
    } else if (enhetType === EnhetType.Tjeneste) {
      return props.resources?.adresseKomponent_velgTjeneste;
    }
    return '';
  };

  const createSelect = (treeNodes: Array<OrgenhetHierarki>, level: number, selectKey: string): JSX.Element => {
    const selectOptions = treeNodes.map(node => new Option(node.Navn, node.OrgenhetId.toString()));
    const label = getLabelText(treeNodes[0].EnhetType) || '';

    // showLabel={true}
    // wrapperClasses="page_refero__receiverselect"

    return (
      <Select
        {...register(safeId, { required: true })}
        key={selectKey}
        selectId={`${getId(props.id)}-${selectKey}`}
        name={`${getId(props.id)}-${selectKey}`}
        label={<Label labelTexts={[{ text: label, type: 'semibold' }]} />}
        required={true}
        value={selectedPath[level] ? selectedPath[level].toString() : ''}
        className="page_refero__input"
        onChange={(evt): void => {
          const newValue = evt.target.value;
          const node = treeNodes.find(x => x.OrgenhetId === parseInt(newValue));
          if (node) {
            onChangeDropdownValue(level, node);
          }
        }}
      >
        {selectOptions}
      </Select>
    );
  };

  const renderSelects = (): JSX.Element => {
    const selectConfigs = [{ key: 'root', selectOptions: receiverTreeNodes }];
    selectedPath.forEach((_x, index) => {
      const searchPath = selectedPath.slice(0, index + 1);
      const treeNodes = findTreeNodeFromPath(receiverTreeNodes, searchPath)?.UnderOrgenheter;
      if (treeNodes && treeNodes.length > 0) {
        return selectConfigs.push({ key: searchPath.toString(), selectOptions: treeNodes });
      }
    });

    return (
      <>
        {selectConfigs.map((config, index) => {
          return createSelect(config.selectOptions, index, config.key);
        })}
      </>
    );
  };

  // const renderErrorMessage = (): JSX.Element | null => {
  //   if (!isValid && isValidated) {
  //     return <ValidationError isValid={isValid ? isValid : false} error={props.resources?.adresseKomponent_feilmelding || ''} />;
  //   }
  //   return null;
  // };

  const wrapperClasses = classNames({
    mol_validation: true,
    'mol_validation--active': !isValid && isValidated,
  });
  return (
    <div className={wrapperClasses} id={getId(props.id)}>
      {/* {renderErrorMessage()} */}
      <h2>{props.resources?.adresseKomponent_header}</h2>
      <div className="page_refero__sublabel">{props.resources?.adresseKomponent_sublabel}</div>

      {isLoading && (
        <div>
          <Loader />
        </div>
      )}
      {hasLoadError && <NotificationPanel variant="alert">{props.resources?.adresseKomponent_loadError}</NotificationPanel>}

      {receiverTreeNodes && receiverTreeNodes.length > 0 && renderSelects()}
      {selectedReceiver && (
        <div>
          <span>{`${props.resources?.adresseKomponent_skjemaSendesTil} `}</span>
          <strong>{selectedReceiver}</strong>
        </div>
      )}
    </div>
  );
};

export default ReceiverComponent;
