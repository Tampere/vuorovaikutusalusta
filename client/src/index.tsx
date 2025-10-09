import React from 'react';
import Application from '@src/components/Application';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { createRoot } from 'react-dom/client';

document.addEventListener('DOMContentLoaded', async () => {
  const appDiv = document.getElementById('app');
  if (appDiv) {
    createRoot(appDiv).render(<Application />);
  }
});
