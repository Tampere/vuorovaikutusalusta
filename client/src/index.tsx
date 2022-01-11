import React from 'react';
import ReactDOM from 'react-dom';
import Application from '@src/components/Application';
import '@fontsource/roboto';

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    React.createElement(Application),
    document.getElementById('app')
  );
});
