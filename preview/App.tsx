import './styles/skjemautfyller.scss';
import './styles/sidebar.scss';

import FormFillerPreview from './FormFillerPreview';

function App(): JSX.Element {
  return (
    <div className="container">
      <FormFillerPreview />
    </div>
  );
}

export default App;
