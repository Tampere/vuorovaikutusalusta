import React from 'react';
import { createRoot } from 'react-dom/client';
import AdminApplication from '@src/components/admin/AdminApplication';
import '@fontsource/nunito/300.css';
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/500.css';
import '@fontsource/nunito/700.css';

document.addEventListener('DOMContentLoaded', async () => {
  const appDiv = document.getElementById('app');
  if (appDiv) {
    createRoot(appDiv).render(<AdminApplication />);
  }
});
