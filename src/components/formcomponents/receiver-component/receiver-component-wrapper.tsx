import * as React from 'react';

import ReceiverComponent, { ReceiverComponentProps } from './receiver-component';
import { getId } from '../../../util';

class ReceiverComponentWrapper extends React.Component<ReceiverComponentProps> {
  render(): JSX.Element {
    return (
      <div className="page_refero__component page_refero__receivercomponent" id={`${getId(this.props.id)}-wrapper`}>
        <ReceiverComponent {...this.props} label={this.props.resources?.adresseKomponent_header} />
      </div>
    );
  }
}
export default ReceiverComponentWrapper;
