import React from 'react';
import ReactDOM from 'react-dom';
import Application from '@src/components/Application';
import '@fontsource/nunito/300.css';
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/500.css';
import '@fontsource/nunito/700.css';

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    React.createElement(Application),
    document.getElementById('app'),
  );
});
