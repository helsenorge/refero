import * as React from 'react';

import Validation from '@helsenorge/designsystem-react/components/Validation';

import ReceiverComponent, { ReceiverComponentProps } from './receiver-component';
import { getId } from '../../../util';

const ReceiverComponentWrapper: React.FC<ReceiverComponentProps> = props => {
  return (
    <div className="page_refero__component page_refero__receivercomponent" id={`${getId(props.id)}-wrapper`}>
      <Validation {...props}>
        <ReceiverComponent {...props} label={props.resources?.adresseKomponent_header} />
      </Validation>
    </div>
  );
};
export default ReceiverComponentWrapper;
