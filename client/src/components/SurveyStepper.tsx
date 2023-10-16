import {
  AnswerEntry,
  SubmissionInfo,
  Survey,
  SurveyMapQuestion,
  SurveyPage,
} from '@interfaces/survey';
import { Close, Image, Map } from '@mui/icons-material';
import {
  Alert,
  Box,
  Chip,
  Drawer,
  FormControl,
  FormHelperText,
  IconButton,
  Link,
  Paper,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { visuallyHidden } from '@mui/utils';
import { useSurveyAnswers } from '@src/stores/SurveyAnswerContext';
import { useSurveyMap } from '@src/stores/SurveyMapContext';
import { useToasts } from '@src/stores/ToastContext';
import { useTranslations } from '@src/stores/TranslationContext';
import { getClassList } from '@src/utils/classes';
import { getFullFilePath } from '@src/utils/path';
import { request } from '@src/utils/request';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import SplitPane from 'react-split-pane';
import DocumentSection from './DocumentSection';
import Footer from './Footer';
import ImageSection from './ImageSection';
import PageConnector from './PageConnector';
import StepperControls from './StepperControls';
import SubmissionInfoDialog from './SubmissionInfoDialog';
import SurveyLanguageMenu from './SurveyLanguageMenu';
import SurveyMap from './SurveyMap';
import SurveyQuestion from './SurveyQuestion';
import TextSection from './TextSection';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    height: '100%',
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
  },
  stepHeaderError: {
    color: 'red !important' as any,
  },
  stepActive: {
    fontSize: '1.1rem',
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
  isTestSurvey: boolean;
}

export default function SurveyStepper({
  survey,
  onComplete,
  isTestSurvey,
}: Props) {
  const [pageNumber, setPageNumber] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageUnfinished, setPageUnfinished] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [submissionInfoDialogOpen, setSubmissionInfoDialogOpen] =
    useState(false);

  const {
    isPageValid,
    answers,
    unfinishedToken,
    getPageInvalidQuestions,
    updatePageMapLayers,
    updateAnswer,
  } = useSurveyAnswers();
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
    getAllLayers,
  } = useSurveyMap();
  const classes = useStyles();
  const { tr, language, surveyLanguage } = useTranslations();
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const currentPage = useMemo<SurveyPage>(
    () => survey.pages[pageNumber],
    [survey, pageNumber],
  );

  const currentPageErrorRef = useRef(null);

  const fullSidebarImagePath = useMemo(
    () =>
      getFullFilePath(
        currentPage.sidebar.imagePath,
        currentPage.sidebar.imageName,
      ),
    [currentPage.sidebar],
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
    // TODO scroll to beginning of the step? or only when "next" is clicked, and not on "previous"?
  }, [currentPage]);

  // Will run on first render and submit
  useEffect(() => {
    currentPageErrorRef?.current?.scrollIntoView();
    currentPageErrorRef?.current?.focus();
  }, [pageUnfinished]);

  // Will handle subsequent submits
  function handleClick() {
    if (!pageUnfinished) {
      return;
    }
    currentPageErrorRef?.current?.scrollIntoView();
    currentPageErrorRef?.current?.focus();
  }

  // Map answer geometries on the current page
  const mapAnswerGeometries = useMemo(() => {
    const mapQuestions = currentPage.sections.filter(
      (section): section is SurveyMapQuestion => section.type === 'map',
    );
    // Reduce all geometries from map question answers into a feature collection
    return mapQuestions.reduce(
      (featureCollection, question) => {
        const answer = answers.find(
          (answer) => answer.sectionId === question.id,
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
                  // Pass entires question and answer index for reopening the subquestion dialog in edit mode
                  properties: {
                    question,
                    index,
                  },
                },
              ],
              [],
            ),
          ],
        };
      },
      {
        type: 'FeatureCollection',
        features: [],
      } as GeoJSON.FeatureCollection,
    );
  }, [currentPage, answers]);

  /**
   * Scroll to page header (=StepLabel) when page changes
   */
  useEffect(() => {
    const heading = document.getElementById(`${pageNumber}-page-heading`);
    if (!heading) return;
    heading.scrollIntoView();
    heading.focus();
  }, [pageNumber]);

  /**
   * Update map geometries when they are changed
   */
  useEffect(() => {
    if (isMapReady && mapAnswerGeometries) {
      updateGeometries(mapAnswerGeometries);
    }
  }, [isMapReady, mapAnswerGeometries]);

  function validateSurveyPage(page: SurveyPage) {
    // If a page is not finished, highlight it
    if (!isPageValid(page)) {
      setPageUnfinished(true);

      return false;
    }
    setPageUnfinished(false);
    return true;
  }

  async function doSubmit(info?: SubmissionInfo) {
    if (isTestSurvey) {
      onComplete();
      return;
    }
    setLoading(true);
    try {
      await request(
        `/api/published-surveys/${survey.name}/submission${
          unfinishedToken ? `?token=${unfinishedToken}` : ''
        }`,
        { method: 'POST', body: { entries: answers, info, language } },
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
  }

  async function saveMapLayers() {
    // Get all currently visible map layer iDs and update to the survey page
    const mapLayers = (await getAllLayers())
      .filter((layer) => layer.visible)
      .map((layer) => layer.id);
    updatePageMapLayers(currentPage, mapLayers);

    // Get all map answer entries on the current page and set their map layers
    const mapQuestionIds = currentPage.sections
      .filter((section): section is SurveyMapQuestion => section.type === 'map')
      .map((question) => question.id);
    answers
      .filter((answer): answer is AnswerEntry & { type: 'map' } =>
        mapQuestionIds.includes(answer.sectionId),
      )
      .forEach((answer) => {
        updateAnswer({
          ...answer,
          value: answer.value.map((value) => ({ ...value, mapLayers })),
        });
      });
  }

  const stepperPane = (
    <>
      {survey.localisationEnabled && (
        <SurveyLanguageMenu
          changeUILanguage={true}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            zIndex: 10,
          }}
        />
      )}
      <main>
        <h1 style={{ marginLeft: '1rem' }}>{survey.title[surveyLanguage]}</h1>

        <Stepper
          className={classes.stepper}
          activeStep={pageNumber}
          orientation="vertical"
          connector={null}
        >
          {survey.pages.map((page, index) => (
            <Step key={page.id} completed={index < pageNumber}>
              <StepLabel
                id={`${index}-page-top`}
                aria-current={index === pageNumber ? 'step' : false}
                classes={{
                  active: classes.stepActive,
                  label: classes.stepHeader,
                }}
              >
                <Typography
                  id={`${index}-page-heading`}
                  component="h2"
                  tabIndex={-1}
                  sx={{
                    margin: 0,
                    fontSize: '1em',
                    '&:focus': { outline: 'none' },
                  }}
                >
                  <span style={visuallyHidden}>
                    {index < pageNumber && tr.SurveyStepper.completedStep}
                    {index > pageNumber && tr.SurveyStepper.futureStep}
                    {tr.SurveyStepper.step} {index + 1} {tr.SurveyStepper.outOf}{' '}
                    {survey?.pages?.length}
                  </span>
                  {page.title?.[language]}
                </Typography>
              </StepLabel>

              <StepContent
                transitionDuration={0}
                classes={{ root: classes.stepContent }}
              >
                {pageUnfinished && (
                  <Box
                    ref={currentPageErrorRef}
                    tabIndex={-1}
                    sx={{ ':focus': { outline: 'none' } }}
                  >
                    <Alert aria-live="off" severity="error">
                      {tr.SurveyStepper.unfinishedAnswers}
                      <p style={visuallyHidden}>
                        {tr.SurveyStepper.unfinishedAnswersInfo}
                      </p>
                      {
                        <ul style={visuallyHidden}>
                          {getPageInvalidQuestions(currentPage).map(
                            (question, index) => {
                              const [questionName, errors] =
                                Object.entries(question)[0];
                              if (errors.includes('required')) {
                                return (
                                  <li key={`${questionName}-${index}`}>
                                    {questionName}
                                  </li>
                                );
                              }
                              return null;
                            },
                          )}
                        </ul>
                      }
                    </Alert>
                  </Box>
                )}
                <FormControl style={{ width: '100%' }} component="fieldset">
                  {currentPage.sidebar.imageName && (
                    <img
                      alt={currentPage.sidebar?.imageAltText?.[surveyLanguage]}
                      src={`/api/file/${fullSidebarImagePath}`}
                      style={visuallyHidden}
                    />
                  )}

                  {page.sections.map((section, _index) => (
                    <div className={classes.section} key={section.id}>
                      {section.type === 'text' ? (
                        <TextSection section={section} />
                      ) : section.type === 'image' ? (
                        <ImageSection section={section} />
                      ) : section.type === 'document' ? (
                        <DocumentSection section={section} />
                      ) : (
                        <SurveyQuestion
                          question={section}
                          pageUnfinished={pageUnfinished}
                          mobileDrawerOpen={mobileDrawerOpen}
                        />
                      )}
                    </div>
                  ))}
                  <StepperControls
                    isTestSurvey={isTestSurvey}
                    activeStep={index}
                    totalSteps={survey.pages.length}
                    onPrevious={async () => {
                      if (currentPage.sidebar.type === 'map')
                        await saveMapLayers();
                      setPageNumber(index - 1);
                      setPageUnfinished(false);
                    }}
                    onNext={async () => {
                      if (validateSurveyPage(page)) {
                        if (currentPage.sidebar.type === 'map')
                          await saveMapLayers();
                        setPageNumber(index + 1);
                      } else {
                        handleClick();
                      }
                    }}
                    disabled={loading}
                    nextDisabled={false}
                    onSubmit={async () => {
                      if (!validateSurveyPage(page)) {
                        handleClick();
                        return;
                      }
                      if (currentPage.sidebar.type === 'map')
                        await saveMapLayers();
                      if (survey.email.enabled) {
                        setSubmissionInfoDialogOpen(true);
                      } else {
                        doSubmit();
                      }
                    }}
                    allowSavingUnfinished={survey.allowSavingUnfinished}
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
      </main>
      <Footer>
        <Link
          color="primary"
          underline="hover"
          href="https://www.tampere.fi/asioi-kaupungin-kanssa/oskari-karttakyselypalvelun-saavutettavuusseloste"
          target="_blank"
        >
          {tr.FooterLinks.accessibility}
        </Link>
        {survey.displayPrivacyStatement && (
          <Link
            color="primary"
            underline="hover"
            href="https://www.tampere.fi/tietosuoja-ja-tiedonhallinta/tietosuojaselosteet"
            target="_blank"
          >
            {tr.FooterLinks.privacyStatement}
          </Link>
        )}
      </Footer>
    </>
  );

  const sidePane = useMemo(() => {
    // Return some component to be rendered in the side pane if a page has a sidebar
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
              display: 'flex',
              alignItems: 'center',
              overflow: 'auto',
              height: '100%',
              width: '100%',
            }}
          >
            {currentPage.sidebar.imageName && (
              <img
                style={
                  currentPage.sidebar.imageSize === 'original'
                    ? { margin: '0 auto' }
                    : currentPage.sidebar.imageSize === 'fitted'
                    ? { margin: '0 auto', maxWidth: '100%' }
                    : null
                }
                alt={currentPage.sidebar?.imageAltText?.[surveyLanguage]}
                src={`/api/file/${fullSidebarImagePath}`}
              />
            )}
          </div>
        );
      case 'none':
        return null;
      default:
        return <div />;
    }
  }, [survey, currentPage.sidebar, surveyLanguage]);

  return (
    <div className={getClassList([classes.root, loading && classes.loading])}>
      {/* Side pane doesn't exist on any page - show the page in 1 column aligned to left */}
      {!sidePane && (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {stepperPane}
        </div>
      )}
      {/* Desktop: side pane exists */}
      {mdUp && sidePane && (
        <SplitPane
          split="vertical"
          defaultSize="50%"
          style={{ position: 'static' }}
          minSize={200}
          maxSize={-200}
          // Allow scrolling for the stepper pane
          pane1Style={{
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
          // Dirty hack to fix iframe resizing issues with the split pane library
          // Issue: https://github.com/tomkp/react-split-pane/issues/361
          // Workaround: https://github.com/tomkp/react-split-pane/issues/241#issuecomment-677091968
          pane2Style={{
            pointerEvents: isResizing ? 'none' : 'auto',
            overflowX:
              currentPage.sidebar.type === 'image' ? 'auto' : 'visible',
          }}
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
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {stepperPane}
          </div>

          <div style={{ flexGrow: 1 }}>{sidePane}</div>
        </>
      )}
      {/* Mobile: side pane exists and current page has some - render the drawer and the button to show it */}
      {!mdUp && sidePane && currentPage.sidebar.type !== 'none' && (
        <>
          <div
            style={{
              marginTop: 50,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {stepperPane}
          </div>

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
                aria-label={
                  currentPage.sidebar.type === 'image'
                    ? tr.SurveyStepper.closeImage
                    : currentPage.sidebar.type === 'map'
                    ? tr.SurveyStepper.closeMap
                    : ''
                }
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
      <SubmissionInfoDialog
        open={submissionInfoDialogOpen}
        onCancel={() => {
          setSubmissionInfoDialogOpen(false);
        }}
        onSubmit={doSubmit}
      />
    </div>
  );
}
