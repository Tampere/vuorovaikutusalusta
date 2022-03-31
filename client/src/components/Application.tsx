import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/open-sans';
import { CssBaseline, StyledEngineProvider } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import AdapterDateFns from '@material-ui/lab/AdapterDateFns';
import LocalizationProvider from '@material-ui/lab/LocalizationProvider';
import SurveyAnswerProvider from '@src/stores/SurveyAnswerContext';
import SurveyMapProvider from '@src/stores/SurveyMapContext';
import ToastProvider from '@src/stores/ToastContext';
import TranslationProvider from '@src/stores/TranslationContext';
import * as themes from '@src/themes/survey';
import fiLocale from 'date-fns/locale/fi';
import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Compose from './Compose';
import { NotFoundPage } from './NotFoundPage';
import './react-split-pane.css';
import SurveyPage from './SurveyPage';

/** Application entry point wrapper */
const Application = () => {
  return (
    <Compose
      components={[
        [
          LocalizationProvider,
          { dateAdapter: AdapterDateFns, locale: fiLocale },
        ],
        // TODO: get theme from survey data
        [ThemeProvider, { theme: themes.survey1 }],
        TranslationProvider,
        ToastProvider,
        SurveyAnswerProvider,
        SurveyMapProvider,
      ]}
    >
      <CssBaseline />
      <StyledEngineProvider injectFirst>
        <BrowserRouter basename="/">
          <Switch>
            <Route path="/:name" exact>
              <SurveyPage />
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
