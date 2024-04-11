import * as React from 'react';

import ReceiverComponent, { ReceiverComponentProps } from './receiver-component';
import { getId } from '../../../util';
import ReactHookFormHoc, { FormProps } from '../../../validation/ReactHookFormHoc';

class ReceiverComponentWrapper extends React.Component<ReceiverComponentProps & FormProps> {
  render(): JSX.Element {
    return (
      <div className="page_refero__component page_refero__receivercomponent" id={`${getId(this.props.id)}-wrapper`}>
        <ReceiverComponent {...this.props} label={this.props.resources?.adresseKomponent_header} />
      </div>
    );
  }
}
const withFormProps = ReactHookFormHoc(ReceiverComponentWrapper);
export default withFormProps;
