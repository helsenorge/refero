// import './init';
import React from 'react';

// import ReactDOM from 'react-dom';
// const container = document.getElementById('root');
// container?.classList.add('root');

// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   container
// );
import App from './App';

import { createRoot } from 'react-dom/client';
const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
