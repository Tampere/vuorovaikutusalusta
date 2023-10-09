import React from 'react';
import ReactDOM from 'react-dom';
import AdminApplication from '@src/components/admin/AdminApplication';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    React.createElement(AdminApplication),
    document.getElementById('app'),
  );
});
