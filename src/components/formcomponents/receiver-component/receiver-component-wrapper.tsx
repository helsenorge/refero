import ReceiverComponent, { type ReceiverComponentProps } from './receiver-component';

import { useExternalRenderContext } from '@/context/externalRender/useExternalRender';
import { getId } from '@/util';

const ReceiverComponentWrapper = (props: ReceiverComponentProps): JSX.Element => {
  const { resources } = useExternalRenderContext();
  return (
    <div className="page_refero__component page_refero__receivercomponent" id={`${getId(props.id)}-wrapper`}>
      <ReceiverComponent {...props} label={resources?.adresseKomponent_header} />
    </div>
  );
};

export default ReceiverComponentWrapper;
