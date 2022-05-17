import { AnswerEntry, Survey } from '@interfaces/survey';
import {
  Chip,
  Drawer,
  FormControl,
  FormHelperText,
  IconButton,
  Paper,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import { Close, Image, Map } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { useSurveyAnswers } from '@src/stores/SurveyAnswerContext';
import { useSurveyMap } from '@src/stores/SurveyMapContext';
import { useToasts } from '@src/stores/ToastContext';
import { useTranslations } from '@src/stores/TranslationContext';
import { getClassList } from '@src/utils/classes';
import { getFullFilePath } from '@src/utils/path';
import { request } from '@src/utils/request';
import React, { useEffect, useMemo, useState } from 'react';
import SplitPane from 'react-split-pane';
import DocumentSection from './DocumentSection';
import ImageSection from './ImageSection';
import PageConnector from './PageConnector';
import StepperControls from './StepperControls';
import SurveyMap from './SurveyMap';
import SurveyQuestion from './SurveyQuestion';
import TextSection from './TextSection';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    height: '100vh',
  },
  stepper: {
    width: '100%',
    maxWidth: '50rem',
    padding: '1rem',
  },
  '@keyframes pulse': {
    '0%': {
      opacity: 0.4,
    },
    '50%': {
      opacity: 0.7,
    },
    '100%': {
      opacity: 0.4,
    },
  },
  loading: {
    animation: `$pulse 1s ${theme.transitions.easing.easeIn} infinite`,
    pointerEvents: 'none',
  },
  section: {
    margin: '1rem 0',
  },
  stepHeader: {
    fontWeight: 'bold !important' as any,
    color: '#22437b !important' as any,
    cursor: 'pointer',
  },
  stepHeaderError: {
    color: 'red !important' as any,
  },
  stepActive: {
    fontSize: '1.1rem',
  },
  stepIcon: {
    '& text': {
      fill: 'white !important' as any,
    },
  },
  stepIconUnfinised: {
    '& svg': {
      color: 'red',
    },
    '& text': {
      fill: 'black',
    },
  },
  stepContent: {
    borderColor: theme?.palette?.primary?.main ?? 'blue',
    borderWidth: '3px',
  },
}));

interface Props {
  survey: Survey;
  onComplete: () => void;
}

export default function SurveyStepper({ survey, onComplete }: Props) {
  const [pageNumber, setPageNumber] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [highlightErrorPages, setHighlightErrorPages] = useState(false);

  const { isPageValid, answers, unfinishedToken } = useSurveyAnswers();
  const { showToast } = useToasts();
  const {
    setVisibleLayers,
    helperText,
    drawing,
    isMapReady,
    stopDrawing,
    selectionType,
    updateGeometries,
    stopModifying,
  } = useSurveyMap();
  const classes = useStyles();
  const { tr } = useTranslations();
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const currentPage = useMemo(
    () => survey.pages[pageNumber],
    [survey, pageNumber]
  );

  const fullSidebarImagePath = useMemo(
    () =>
      getFullFilePath(
        currentPage.sidebar.imagePath,
        currentPage.sidebar.imageName
      ),
    [currentPage.sidebar]
  );

  /**
   * Show/hide mobile map when the drawing status of the map changes
   */
  useEffect(() => {
    setMobileDrawerOpen(drawing);
  }, [drawing]);

  /**
   * Stop the drawing interaction when the mobile map gets closed
   */
  useEffect(() => {
    if (!mobileDrawerOpen && isMapReady) {
      stopDrawing();
    }
  }, [mobileDrawerOpen]);

  /**
   * Update map's visible layers when page changes
   */
  useEffect(() => {
    setVisibleLayers(currentPage.sidebar.mapLayers);
    // If modifying, stop it when changing page
    if (isMapReady) {
      stopModifying();
    }
  }, [currentPage]);

  // Map answer geometries on the current page
  const mapAnswerGeometries = useMemo(() => {
    const mapQuestions = currentPage.sections.filter(
      (section) => section.type === 'map'
    );
    // Reduce all geometries from map question answers into a feature collection
    return mapQuestions.reduce(
      (featureCollection, question) => {
        const answer = answers.find(
          (answer) => answer.sectionId === question.id
        ) as AnswerEntry & { type: 'map' };
        return {
          ...featureCollection,
          features: [
            ...featureCollection.features,
            ...answer.value.reduce(
              (features, value, index) => [
                ...features,
                {
                  ...value.geometry,
                  // Add a unique index to prevent conflicts
                  id: `feature-${question.id}-${index}`,
                  // Pass question ID and answer index for reopening the subquestion dialog in edit mode
                  properties: {
                    questionId: question.id,
                    index,
                  },
                },
              ],
              []
            ),
          ],
        };
      },
      {
        type: 'FeatureCollection',
        features: [],
      } as GeoJSON.FeatureCollection
    );
  }, [currentPage, answers]);

  /**
   * Update map geometries when they are changed
   */
  useEffect(() => {
    if (isMapReady && mapAnswerGeometries) {
      updateGeometries(mapAnswerGeometries);
    }
  }, [isMapReady, mapAnswerGeometries]);

  const stepperPane = (
    <Stepper
      className={classes.stepper}
      activeStep={pageNumber}
      orientation="vertical"
      connector={null}
    >
      {survey.pages.map((page, index) => (
        <Step key={page.id} completed={false}>
          <StepLabel
            onClick={() => {
              setPageNumber(index);
            }}
            classes={{
              active: classes.stepActive,
              label: `${classes.stepHeader} ${
                highlightErrorPages && !isPageValid(page)
                  ? classes.stepHeaderError
                  : ''
              }`,
              iconContainer:
                index === pageNumber
                  ? classes.stepIcon
                  : (highlightErrorPages && !isPageValid(page)) ||
                    (pageNumber > index && !isPageValid(page))
                  ? classes.stepIconUnfinised
                  : null,
            }}
          >
            {page.title}
          </StepLabel>
          <StepContent classes={{ root: classes.stepContent }}>
            <FormControl style={{ width: '100%' }} component="fieldset">
              {page.sections.map((section) => (
                <div className={classes.section} key={section.id}>
                  {section.type === 'text' ? (
                    <TextSection section={section} />
                  ) : section.type === 'image' ? (
                    <ImageSection section={section} />
                  ) : section.type === 'document' ? (
                    <DocumentSection section={section} />
                  ) : (
                    <SurveyQuestion question={section} />
                  )}
                </div>
              ))}
              <StepperControls
                activeStep={index}
                totalSteps={survey.pages.length}
                onPrevious={() => {
                  setPageNumber(index - 1);
                }}
                onNext={() => {
                  setPageNumber(index + 1);
                }}
                disabled={loading}
                nextDisabled={false}
                onSubmit={async () => {
                  // If a page is not finished, highlight it
                  const unfinishedPages = survey.pages.filter(
                    (page) => !isPageValid(page)
                  );
                  if (unfinishedPages.length !== 0) {
                    setHighlightErrorPages(true);
                    showToast({
                      severity: 'error',
                      message: tr.SurveyStepper.unfinishedAnswers,
                    });
                    return;
                  }

                  setLoading(true);
                  try {
                    await request(
                      `/api/published-surveys/${survey.name}/submission${
                        unfinishedToken ? `?token=${unfinishedToken}` : ''
                      }`,
                      { method: 'POST', body: { entries: answers } }
                    );
                    setLoading(false);
                    onComplete();
                  } catch (error) {
                    showToast({
                      severity: 'error',
                      message: tr.SurveyStepper.errorSubmittingSurvey,
                    });
                    setLoading(false);
                  }
                }}
              />
            </FormControl>
          </StepContent>
          {
            /** Don't show connector after the final page */
            index + 1 !== survey?.pages?.length && (
              <PageConnector
                activePage={pageNumber}
                pageIndex={index}
                theme={theme}
              />
            )
          }
        </Step>
      ))}
    </Stepper>
  );

  const sidePane = useMemo(() => {
    // If none of the pages has a sidebar, hide the pane completely
    if (survey.pages.every((page) => page.sidebar.type === 'none')) {
      return null;
    }
    // Otherwise return some component to be rendered in the side pane
    switch (currentPage.sidebar.type) {
      case 'map':
        return (
          <SurveyMap
            url={survey.mapUrl}
            layers={currentPage.sidebar.mapLayers}
          />
        );
      case 'image':
        return (
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto',
            }}
          >
            <div style={{ margin: 'auto' }}>
              {currentPage.sidebar.imageName && (
                <img
                  alt={currentPage.sidebar.imageAltText}
                  src={`/api/file/${fullSidebarImagePath}`}
                  style={{ width: '100%', maxHeight: '100vh' }}
                />
              )}
            </div>
          </div>
        );
      case 'none':
      default:
        return <div />;
    }
  }, [survey, currentPage.sidebar]);

  return (
    <div className={getClassList([classes.root, loading && classes.loading])}>
      {/* Side pane doesn't exist on any page - show the page in 1 column */}
      {!sidePane && (
        <div
          style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
        >
          {stepperPane}
        </div>
      )}
      {/* Desktop: side pane exists */}
      {mdUp && sidePane && (
        <SplitPane
          split="vertical"
          defaultSize="50%"
          minSize={200}
          maxSize={-200}
          // Allow scrolling for the stepper pane
          pane1Style={{ overflowY: 'auto' }}
          // Dirty hack to fix iframe resizing issues with the split pane library
          // Issue: https://github.com/tomkp/react-split-pane/issues/361
          // Workaround: https://github.com/tomkp/react-split-pane/issues/241#issuecomment-677091968
          pane2Style={{ pointerEvents: isResizing ? 'none' : 'auto' }}
          onDragStarted={() => {
            setIsResizing(true);
          }}
          onDragFinished={() => {
            setIsResizing(false);
          }}
        >
          {stepperPane}
          {sidePane}
        </SplitPane>
      )}
      {/* Mobile: side pane exists but current page has none */}
      {!mdUp && sidePane && currentPage.sidebar.type === 'none' && (
        <>
          <div>{stepperPane}</div>
          <div style={{ flexGrow: 1 }}>{sidePane}</div>
        </>
      )}
      {/* Mobile: side pane exists and current page has some - render the drawer and the button to show it */}
      {!mdUp && sidePane && currentPage.sidebar.type !== 'none' && (
        <>
          <div style={{ marginTop: 50 }}>{stepperPane}</div>

          <Paper
            elevation={3}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              height: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fff',
              zIndex: 1,
            }}
          >
            {currentPage.sidebar.type === 'map' && (
              <Chip
                color="secondary"
                icon={<Map />}
                label={tr.SurveyStepper.openMap}
                onClick={() => {
                  setMobileDrawerOpen(true);
                }}
              />
            )}
            {currentPage.sidebar.type === 'image' && (
              <Chip
                color="secondary"
                icon={<Image />}
                label={tr.SurveyStepper.openImage}
                onClick={() => {
                  setMobileDrawerOpen(true);
                }}
              />
            )}
          </Paper>
          <Drawer
            anchor="top"
            open={mobileDrawerOpen}
            onClose={() => {
              setMobileDrawerOpen(false);
            }}
            PaperProps={{
              style: {
                height: 'calc(100% - 100px)',
              },
            }}
            ModalProps={{
              keepMounted: true,
            }}
          >
            <Paper
              elevation={3}
              style={{
                minHeight: '4rem',
                padding: '1rem',
                zIndex: 10,
                position: 'sticky',
                top: 0,
              }}
            >
              <IconButton
                style={{ float: 'right' }}
                onClick={() => {
                  setMobileDrawerOpen(false);
                }}
              >
                <Close />
              </IconButton>
              {drawing && (
                <>
                  <Typography>{helperText}</Typography>
                  <FormHelperText>
                    {tr.MapQuestion.selectionHelperText[selectionType]}
                  </FormHelperText>
                </>
              )}
            </Paper>
            <div style={{ flexGrow: 1 }}>{sidePane}</div>
          </Drawer>
        </>
      )}
    </div>
  );
}
