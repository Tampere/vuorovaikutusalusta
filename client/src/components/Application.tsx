import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/open-sans';
import { CssBaseline, StyledEngineProvider } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV2';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import SurveyAnswerProvider from '@src/stores/SurveyAnswerContext';
import SurveyMapProvider from '@src/stores/SurveyMapContext';
import SurveyThemeProvider from '@src/stores/SurveyThemeProvider';
import ToastProvider from '@src/stores/ToastContext';
import TranslationProvider from '@src/stores/TranslationContext';
import fiLocale from 'date-fns/locale/fi';
import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Compose from './Compose';
import { NotFoundPage } from './NotFoundPage';
import './react-split-pane.css';
import SurveyPage from './SurveyPage';
import SurveyLanguageRouter from './SurveyLanguageRouter';

/** Application entry point wrapper component */
const Application = () => {
  return (
    <Compose
      components={[
        [
          LocalizationProvider,
          { dateAdapter: AdapterDateFns, adapterLocale: fiLocale },
        ],
        SurveyThemeProvider,
        TranslationProvider,
        ToastProvider,
        SurveyAnswerProvider,
        SurveyMapProvider,
      ]}
    >
      <CssBaseline />
      <StyledEngineProvider injectFirst>
        <BrowserRouter basename="/">
          <SurveyLanguageRouter />
          <Switch>
            <Route path="/:name" exact>
              <SurveyPage />
            </Route>
            <Route path="/:name/testi">
              <SurveyPage isTestSurvey />
            </Route>
            <Route>
              <NotFoundPage />
            </Route>
          </Switch>
        </BrowserRouter>
      </StyledEngineProvider>
    </Compose>
  );
};

export default Application;
