import React, { useState } from 'react';
import './styles/skjemautfyller.scss';
import './styles/sidebar.scss';
import './styles/refero.scss';

import FormFillerPreview from './FormFillerPreview';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function App() {
  const [show, setShow] = useState(true);
  return (
    <>
      {/*eslint-disable-next-line*/}
      <FormFillerPreview
        showFormFiller={(): void => {
          setShow(prevState => !prevState);
          console.log('avbryt');
        }}
      />
    </>
  );
}

export default App;
