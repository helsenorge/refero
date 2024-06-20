// import './init';
import React from 'react';

import ReactDOM from 'react-dom';

import App from './App';

const container = document.getElementById('root');
container?.classList.add('root');

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  container
);
