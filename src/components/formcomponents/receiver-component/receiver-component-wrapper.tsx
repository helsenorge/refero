import * as React from 'react';

import Validation from '@helsenorge/toolkit/components/molecules/form/validation';

import ReceiverComponent, { ReceiverComponentProps } from './receiver-component';

class ReceiverComponentWrapper extends React.Component<ReceiverComponentProps> {
  render(): JSX.Element {
    return (
      <div className="page_skjemautfyller__component page_skjemautfyller__receivercomponent" id={`${this.props.id}-wrapper`}>
        <Validation {...this.props}>
          <ReceiverComponent {...this.props} />
        </Validation>
      </div>
    );
  }
}
export default ReceiverComponentWrapper;
