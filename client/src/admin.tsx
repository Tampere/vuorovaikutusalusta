import React from 'react';
import ReactDOM from 'react-dom';
import AdminApplication from '@src/components/admin/AdminApplication';
import '@fontsource/roboto';

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    React.createElement(AdminApplication),
    document.getElementById('app')
  );
});
