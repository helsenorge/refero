import './styles/skjemautfyller.scss';

import type React from 'react';

import FormFillerPreview from './FormFillerPreview';

function App(): React.JSX.Element {
  return (
    <div className="container">
      <FormFillerPreview />
    </div>
  );
}

export default App;
