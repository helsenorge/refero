import './init';

import { useState } from 'react';
import './styles/skjemautfyller.scss';
import './styles/sidebar.scss';
import './styles/refero.scss';

import FormFillerPreview from './FormFillerPreview';

function App(): JSX.Element {
  const [, setShow] = useState(true);
  return (
    <div className="container">
      {/*eslint-disable-next-line*/}
      <FormFillerPreview
        showFormFiller={(): void => {
          setShow(prevState => !prevState);
        }}
      />
    </div>
  );
}

export default App;
