import React, { useState } from 'react';
import './styles/skjemautfyller.scss';
import './styles/sidebar.scss';
import './styles/refero.scss';
// import './styles/formFillerPreview.css';
// import './styles/formFillerSidebar.css';

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
        }}
      />
    </>
  );
}

export default App;
