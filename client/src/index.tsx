import React from 'react';
import ReactDOM from 'react-dom';
import Application from '@src/components/Application';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    React.createElement(Application),
    document.getElementById('app'),
  );
});
