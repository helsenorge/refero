import "./init"

import React, { useState } from 'react';
import './styles/skjemautfyller.scss';
import './styles/sidebar.scss';
import './styles/refero.scss';

import FormFillerPreview from './FormFillerPreview';

function App() {
  const [show, setShow] = useState(true);
  return (
    <>
      {/*eslint-disable-next-line*/}
      <FormFillerPreview
        showFormFiller={(): void => {
          setShow(prevState => !prevState);
        }}
      />
    </>
  );
}

export default App;
