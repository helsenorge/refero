import ReceiverComponent, { ReceiverComponentProps } from './receiver-component';
import { getId } from '../../../util';
import { FormProps } from '../../../validation/ReactHookFormHoc';

const ReceiverComponentWrapper = (props: ReceiverComponentProps & FormProps): JSX.Element => {
  return (
    <div className="page_refero__component page_refero__receivercomponent" id={`${getId(props.id)}-wrapper`}>
      <ReceiverComponent {...props} label={props.resources?.adresseKomponent_header} />
    </div>
  );
};

export default ReceiverComponentWrapper;
