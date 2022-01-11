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
import { Close, Map } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { useSurveyAnswers } from '@src/stores/SurveyAnswerContext';
import { useSurveyMap } from '@src/stores/SurveyMapContext';
import { useToasts } from '@src/stores/ToastContext';
import { useTranslations } from '@src/stores/TranslationContext';
import { getClassList } from '@src/utils/classes';
import { request } from '@src/utils/request';
import { InfoBox } from 'oskari-rpc';
import React, { useEffect, useMemo, useState } from 'react';
import SplitPane from 'react-split-pane';
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
}));

interface Props {
  survey: Survey;
  onComplete: () => void;
}

export default function SurveyStepper({ survey, onComplete }: Props) {
  const [pageNumber, setPageNumber] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [mobileMapOpen, setMobileMapOpen] = useState(false);

  const { isPageValid, answers } = useSurveyAnswers();
  const { showToast } = useToasts();
  const {
    setDisabled,
    setVisibleLayers,
    helperText,
    isMapActive,
    isMapReady,
    stopDrawing,
    selectionType,
    showGeometries,
    clearGeometries,
  } = useSurveyMap();
  const classes = useStyles();
  const { tr } = useTranslations();
  const theme = useTheme();
  // TODO: enable mobile map once event handler problem when resizing the window is fixed!
  const mdUp = useMediaQuery(theme.breakpoints.up('md')) || true;
  const currentPage = useMemo(
    () => survey.pages[pageNumber],
    [survey, pageNumber]
  );

  /**
   * Show/hide mobile map when the active status of the map changes
   */
  useEffect(() => {
    setMobileMapOpen(isMapActive);
  }, [isMapActive]);

  /**
   * Stop the drawing interaction when the mobile map gets closed
   */
  useEffect(() => {
    if (!mobileMapOpen && isMapReady) {
      stopDrawing();
    }
  }, [mobileMapOpen]);

  /**
   * Update map disabled state and visible layers when page changes
   */
  useEffect(() => {
    const mapQuestions = currentPage.sections.filter(
      (section) => section.type === 'map'
    );
    setDisabled(!mapQuestions.length);
    setVisibleLayers(currentPage.mapLayers);
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
                  // Pass info box data via feature properties
                  properties: {
                    infoBox: {
                      title: tr.MapInfoBox.answer,
                      contents: [
                        {
                          html: `<div>${question.title}</div>`,
                        },
                        {
                          html: `<div>${tr.MapInfoBox.answer} #${index + 1}/${
                            answer.value.length
                          }</div>`,
                        },
                        {
                          actions: [
                            {
                              name: tr.commands.remove,
                              type: 'button',
                              action: {
                                questionId: question.id,
                                answerIndex: index,
                              },
                            },
                          ],
                        },
                      ] as InfoBox.ContentItem[],
                    },
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
  // TODO: geometries aren't redrawn in either mobile or split pane map when mobile/md breakpoint is reached
  useEffect(() => {
    if (isMapReady && mapAnswerGeometries) {
      if (!mapAnswerGeometries.features.length) {
        clearGeometries();
      } else {
        showGeometries(mapAnswerGeometries);
      }
    }
  }, [isMapReady, mapAnswerGeometries]);

  const stepperPane = (
    <Stepper
      className={classes.stepper}
      activeStep={pageNumber}
      orientation="vertical"
    >
      {survey.pages.map((page, index) => (
        <Step key={page.id}>
          <StepLabel>{page.title}</StepLabel>
          <StepContent>
            <FormControl style={{ width: '100%' }} component="fieldset">
              {page.sections.map((section) => (
                <div className={classes.section} key={section.id}>
                  {section.type === 'text' && <TextSection section={section} />}
                  {section.type !== 'text' && (
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
                nextDisabled={!isPageValid(page)}
                onSubmit={async () => {
                  setLoading(true);
                  try {
                    await request(
                      `/api/published-surveys/${survey.name}/submission`,
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
        </Step>
      ))}
    </Stepper>
  );

  const mapPane = (
    <SurveyMap url={survey.mapUrl} layers={currentPage.mapLayers} />
  );

  return (
    <div className={getClassList([classes.root, loading && classes.loading])}>
      {mdUp && (
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
          {mapPane}
        </SplitPane>
      )}
      {!mdUp && (
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
            }}
          >
            <Chip
              color="secondary"
              icon={<Map />}
              label={tr.SurveyStepper.openMap}
              onClick={() => {
                setMobileMapOpen(true);
              }}
            />
          </Paper>
          <Drawer
            anchor="top"
            open={mobileMapOpen}
            onClose={() => {
              setMobileMapOpen(false);
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
              style={{ minHeight: 50, padding: '1rem', zIndex: 10 }}
            >
              <IconButton
                style={{ float: 'right' }}
                onClick={() => {
                  setMobileMapOpen(false);
                }}
              >
                <Close />
              </IconButton>
              {isMapActive && (
                <>
                  <Typography>{helperText}</Typography>
                  <FormHelperText>
                    {tr.MapQuestion.selectionHelperText[selectionType]}
                  </FormHelperText>
                </>
              )}
            </Paper>
            <div style={{ flexGrow: 1 }}>{mapPane}</div>
          </Drawer>
        </>
      )}
    </div>
  );
}
