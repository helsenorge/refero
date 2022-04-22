import * as React from 'react';

import Validation from '@helsenorge/form/components/form/validation';

import { getId } from '../../../util';
import ReceiverComponent, { ReceiverComponentProps } from './receiver-component';

class ReceiverComponentWrapper extends React.Component<ReceiverComponentProps> {
  render(): JSX.Element {
    return (
      <div className="page_skjemautfyller__component page_skjemautfyller__receivercomponent" id={`${getId(this.props.id)}-wrapper`}>
        <Validation {...this.props}>
          <ReceiverComponent {...this.props} label={this.props.resources?.adresseKomponent_header} />
        </Validation>
      </div>
    );
  }
}
export default ReceiverComponentWrapper;
