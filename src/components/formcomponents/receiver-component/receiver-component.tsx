import React from 'react';

import { type FieldValues, type RegisterOptions, useFormContext } from 'react-hook-form';

import type { QuestionnaireComponentItemProps } from '@/components/createQuestionnaire/GenerateQuestionnaireComponents';
import type { Coding, QuestionnaireItem } from 'fhir/r4';

import FormGroup from '@helsenorge/designsystem-react/components/FormGroup';
import Loader from '@helsenorge/designsystem-react/components/Loader';
import NotificationPanel from '@helsenorge/designsystem-react/components/NotificationPanel';
import Select from '@helsenorge/designsystem-react/components/Select';

import styles from '../common-styles.module.css';
import { ReadOnly } from '../read-only/readOnly';

import { ReferoLabel } from '@/components/referoLabel/ReferoLabel';
import { getErrorMessage, required } from '@/components/validation/rules';
import { shouldValidate } from '@/components/validation/utils';
import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';
import { EnhetType, type OrgenhetHierarki } from '@/types/orgenhetHierarki';
import { getId, isReadOnly } from '@/util';

export type ReceiverComponentProps = QuestionnaireComponentItemProps & {
  item?: QuestionnaireItem;
  selected?: Array<string | undefined>;
  id?: string;
  label?: string;
  handleChange: (code?: string, systemArg?: string, displayArg?: string) => void;
  clearCodingAnswer: (coding: Coding) => void;
  idWithLinkIdAndItemIndex: string;
  pdfValue?: string | number;
  children?: React.ReactNode;
};

const ReceiverComponent = ({
  item,
  selected,
  id,
  handleChange,
  clearCodingAnswer,
  idWithLinkIdAndItemIndex,
  pdf,
  pdfValue,
  children,
}: ReceiverComponentProps): React.JSX.Element | null => {
  const { formState, getFieldState, register } = useFormContext<FieldValues>();
  const [receiverTreeNodes, setReceiverTreeNodes] = React.useState<OrgenhetHierarki[]>([]);
  const [selectedPath, setSelectedPath] = React.useState<number[]>([]);
  const [selectedReceiver, setSelectedReceiver] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [hasLoadError, setHasLoadError] = React.useState<boolean>(false);
  const { fetchReceivers, resources } = useExternalRenderContext();
  React.useEffect(() => {
    if (fetchReceivers) {
      fetchReceivers(loadSuccessCallback, loadErrorCallback);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSuccessCallback = (receiverTreeNodes: Array<OrgenhetHierarki>): void => {
    const pathsToEndPoint = selected ? findPathToEndpointNode(receiverTreeNodes, selected[0] || '') : [];
    const selectedPath = pathsToEndPoint.length === 1 ? pathsToEndPoint[0] : [];
    const selectedReceiver = getReceiverName(receiverTreeNodes, selectedPath);
    setIsLoading(false);
    setReceiverTreeNodes(receiverTreeNodes);
    setSelectedPath(selectedPath);
    setSelectedReceiver(selectedReceiver);
    setHasLoadError(receiverTreeNodes.length === 0);

    // clear answer if more than one receiver match the selected endpoint
    if (selectedPath.length === 0 && selected && selected.length > 0) {
      clearCodingAnswer({ code: selected[0] });
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
      handleChange(getEndepunktVerdi(selectedNode.EndepunktId) || '', '', selectedNode.Navn);
    } else if (selected) {
      // clear previous answer when another node than a leaf node is selected
      clearCodingAnswer({ code: selected[0] });
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
      return resources?.adresseKomponent_velgHelseregion;
    } else if (enhetType === EnhetType.Foretak) {
      return resources?.adresseKomponent_velgHelseforetak;
    } else if (enhetType === EnhetType.Sykehus) {
      return resources?.adresseKomponent_velgSykehus;
    } else if (enhetType === EnhetType.Klinikk) {
      return resources?.adresseKomponent_velgKlinikk;
    } else if (enhetType === EnhetType.Avdeling) {
      return resources?.adresseKomponent_velgAvdeling;
    } else if (enhetType === EnhetType.Seksjon) {
      return resources?.adresseKomponent_velgSeksjon;
    } else if (enhetType === EnhetType.Sengepost) {
      return resources?.adresseKomponent_velgSengepost;
    } else if (enhetType === EnhetType.Poliklinikk) {
      return resources?.adresseKomponent_velgPoliklinikk;
    } else if (enhetType === EnhetType.Tjeneste) {
      return resources?.adresseKomponent_velgTjeneste;
    }
    return '';
  };

  const createSelect = (treeNodes: Array<OrgenhetHierarki>, level: number, selectKey: string): React.JSX.Element => {
    const fieldState = getFieldState(`${idWithLinkIdAndItemIndex}-${selectKey}`, formState);
    const { error } = fieldState;

    const selectOptions = treeNodes.map(node => new Option(node.Navn, node.OrgenhetId.toString()));

    const label = getLabelText(treeNodes[0].EnhetType) || '';
    const value = selectedPath[level] ? selectedPath[level].toString() : '';
    const errorMessage = getErrorMessage(item, error);

    const handleSelectChange = (evt: React.ChangeEvent<HTMLSelectElement>): void => {
      const newValue = evt.target.value;
      const node = treeNodes.find(x => x.OrgenhetId === parseInt(newValue));
      if (node) {
        onChangeDropdownValue(level, node);
      }
    };

    const validationRules: RegisterOptions<FieldValues, string> | undefined = {
      required: required({ item, resources, message: resources?.adresseKomponent_feilmelding }),
      shouldUnregister: true,
    };
    const { onChange, ...rest } = register(
      `${idWithLinkIdAndItemIndex}-${selectKey}`,
      shouldValidate(item, pdf) ? validationRules : undefined
    );

    if (pdf || isReadOnly(item)) {
      return (
        <ReadOnly
          pdf={pdf}
          id={id}
          idWithLinkIdAndItemIndex={idWithLinkIdAndItemIndex}
          item={item}
          value={value}
          pdfValue={pdfValue}
          errors={error}
        >
          {children}
        </ReadOnly>
      );
    }
    return (
      <FormGroup error={errorMessage} errorWrapperClassName={styles.paddingBottom}>
        <ReferoLabel
          item={item}
          resources={resources}
          htmlFor={`${getId(id)}-${selectKey}`}
          labelId={`${getId(id)}-label`}
          testId={`${getId(id)}-label-test`}
          sublabelId={`${getId(id)}-sublabel`}
          labelText={label}
          formFieldTagId={`${getId(id)}-receiver-${selectKey}-formfieldtag`}
        />
        <Select
          {...rest}
          aria-describedby={`${getId(id)}-receiver-${selectKey}-formfieldtag`}
          key={`${selectKey}-${level}`}
          onChange={(e): void => {
            handleSelectChange(e);
            onChange(e);
          }}
          value={value}
          testId={`${getId(id)}-${selectKey}`}
          selectId={`${getId(id)}-${selectKey}`}
          className="page_refero__input"
        >
          {!value && <option value={''}>{resources?.selectDefaultPlaceholder}</option>}
          {selectOptions.map(option => {
            return (
              <option key={`${option.value}-${option.label}`} value={option.value}>
                {option.label}
              </option>
            );
          })}
        </Select>
      </FormGroup>
    );
  };

  const renderSelects = (): React.JSX.Element => {
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
      <h2>{resources?.adresseKomponent_header}</h2>
      <div className="page_refero__sublabel">{resources?.adresseKomponent_sublabel}</div>

      {isLoading && (
        <div>
          <Loader color="black" />
        </div>
      )}
      {hasLoadError && <NotificationPanel variant="error">{resources?.adresseKomponent_loadError}</NotificationPanel>}

      {receiverTreeNodes.length > 0 && renderSelects()}
      {selectedReceiver && (
        <div>
          <span>{`${resources?.adresseKomponent_skjemaSendesTil} `}</span>
          <strong>{selectedReceiver}</strong>
        </div>
      )}
    </div>
  );
};

export default ReceiverComponent;
