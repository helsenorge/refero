import * as React from 'react';

import { Coding } from 'fhir/r4';
import { Controller } from 'react-hook-form';

import { EnhetType, OrgenhetHierarki } from '../../../types/orgenhetHierarki';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Label from '@helsenorge/designsystem-react/components/Label';
import Loader from '@helsenorge/designsystem-react/components/Loader';
import NotificationPanel from '@helsenorge/designsystem-react/components/NotificationPanel';
import Select from '@helsenorge/designsystem-react/components/Select';

import { getId } from '../../../util';
import { Resources } from '../../../util/resources';
import { FormProps } from '../../../validation/ReactHookFormHoc';

export interface ReceiverComponentProps {
  selected?: Array<string | undefined>;
  id?: string;
  resources?: Resources;
  label?: string;
  fetchReceivers?: (successCallback: (receivers: Array<OrgenhetHierarki>) => void, errorCallback: () => void) => void;
  handleChange: (code?: string, systemArg?: string, displayArg?: string) => void;
  clearCodingAnswer: (coding: Coding) => void;
  idWithLinkIdAndItemIndex: string;
  children?: React.ReactNode;
}

interface ReceiverComponentState {
  selectedPath: Array<number>;
  selectedReceiver: string;
  receiverTreeNodes: Array<OrgenhetHierarki>;
  isLoading: boolean;
  hasLoadError: boolean;
}

const ReceiverComponent = (props: ReceiverComponentProps & FormProps): JSX.Element | null => {
  const [receiverTreeNodes, setReceiverTreeNodes] = React.useState<OrgenhetHierarki[]>([]);
  const [selectedPath, setSelectedPath] = React.useState<number[]>([]);
  const [selectedReceiver, setSelectedReceiver] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [hasLoadError, setHasLoadError] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (props.fetchReceivers) {
      props.fetchReceivers(loadSuccessCallback, loadErrorCallback);
    }
  }, []);

  // componentDidMount(): void {
  //   if (props.fetchReceivers) {
  //     props.fetchReceivers(loadSuccessCallback, loadErrorCallback);
  //   }
  // }

  const loadSuccessCallback = (receiverTreeNodes: Array<OrgenhetHierarki>): void => {
    const pathsToEndPoint = props.selected ? findPathToEndpointNode(receiverTreeNodes, props.selected[0] || '') : [];
    const selectedPath = pathsToEndPoint.length === 1 ? pathsToEndPoint[0] : [];
    const selectedReceiver = getReceiverName(receiverTreeNodes, selectedPath);
    setIsLoading(false);
    setReceiverTreeNodes(receiverTreeNodes);
    setSelectedPath(selectedPath);
    setSelectedReceiver(selectedReceiver);
    setHasLoadError(receiverTreeNodes.length === 0);

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
    setSelectedPath(prevState => [...prevState.filter((_x, index) => index < level), selectedNode.OrgenhetId]);
    setSelectedReceiver(
      getReceiverName(receiverTreeNodes, [...selectedPath.filter((_x, index) => index < level), selectedNode.OrgenhetId])
    );
    // setState((prevState: ReceiverComponentState) => {
    //   const prevSelectedValues = prevselectedPath.filter((_x, index) => index < level);
    //   const newSelectedPath = [...prevSelectedValues, selectedNode.OrgenhetId];
    //   const selectedReceiver = isLeafNode ? getReceiverName(receiverTreeNodes, newSelectedPath) : '';
    //   return {
    //     selectedPath: newSelectedPath,
    //     selectedReceiver: selectedReceiver,
    //   };
    // });

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

    const handleSelectChange = (evt: React.ChangeEvent<HTMLSelectElement>): void => {
      const newValue = evt.target.value;
      const node = treeNodes.find(x => x.OrgenhetId === parseInt(newValue));
      if (node) {
        onChangeDropdownValue(level, node);
      }
    };

    return (
      <FormGroup error={props.error?.message}>
        <Controller
          key={`${selectKey}-${level}`}
          name={`${props.idWithLinkIdAndItemIndex}-${selectKey}`}
          control={props.control}
          shouldUnregister={true}
          rules={{
            required: {
              value: true,
              message: props.resources?.adresseKomponent_feilmelding || 'Påkrevd felt',
            },
            validate: (): true | string =>
              !!getReceiverName(receiverTreeNodes, selectedPath)
                ? true
                : props.resources?.adresseKomponent_feilmelding || 'Kan ikke være tom streng',
          }}
          render={({ field: { onChange, ...rest } }): JSX.Element => (
            <Select
              {...rest}
              onChange={(e): void => {
                handleSelectChange(e);
                onChange(e.target.value);
              }}
              value={selectedPath[level] ? selectedPath[level].toString() : ''}
              testId={`${getId(props.id)}-${selectKey}`}
              selectId={`${getId(props.id)}-${selectKey}`}
              label={<Label labelTexts={[{ text: label, type: 'semibold' }]} />}
              className="page_refero__input"
            >
              {selectOptions.map(option => {
                return (
                  <option key={`${option.value}-${option.label}`} value={option.value}>
                    {option.label}
                  </option>
                );
              })}
            </Select>
          )}
        />
      </FormGroup>
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
          return <React.Fragment key={index}>{createSelect(config.selectOptions, index, config.key)}</React.Fragment>;
        })}
      </>
    );
  };

  return (
    <div>
      <h2>{props.resources?.adresseKomponent_header}</h2>
      <div className="page_refero__sublabel">{props.resources?.adresseKomponent_sublabel}</div>

      {isLoading && (
        <div>
          <Loader />
        </div>
      )}
      {hasLoadError && <NotificationPanel variant="alert">{props.resources?.adresseKomponent_loadError}</NotificationPanel>}

      {receiverTreeNodes.length > 0 && renderSelects()}
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
