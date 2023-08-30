import {
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Skeleton,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  Radio,
  RadioGroup,
  Fab,
} from '@mui/material';
import { ContentPaste } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { useSurvey } from '@src/stores/SurveyContext';
import { useToasts } from '@src/stores/ToastContext';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import ConfirmDialog from '../ConfirmDialog';
import Fieldset from '../Fieldset';
import AddSurveySectionActions from './AddSurveySectionActions';
import FileUpload from './FileUpload';
import SurveySections from './SurveySections';
import {
  SurveyPageSection,
  SurveyPageSidebarImageSize,
} from '@interfaces/survey';
import {
  replaceIdsWithNull,
  replaceTranslationsWithNull,
} from '@src/utils/schemaValidation';
import { request } from '@src/utils/request';

const useStyles = makeStyles({
  button: {
    width: 'fit-content',
  },
});

export default function EditSurveyPage() {
  const [loading, setLoading] = useState(false);
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<number>(null);

  const classes = useStyles();
  const { surveyId, pageId } = useParams<{
    surveyId: string;
    pageId: string;
  }>();
  const {
    activeSurvey,
    activeSurveyLoading,
    editPage,
    deletePage,
    addSection,
    availableMapLayers,
    availableMapLayersLoading,
  } = useSurvey();
  const history = useHistory();
  const { tr, surveyLanguage } = useTranslations();
  const { showToast } = useToasts();

  const page = useMemo(() => {
    return activeSurvey.pages.find((page) => page.id === Number(pageId));
  }, [activeSurvey, pageId]);

  // If page ID in URL doesn't exist, redirect to survey front page
  useEffect(() => {
    if (activeSurvey && !page) {
      history.push(`/kyselyt/${surveyId}`);
    }
  }, [activeSurvey, page]);

  // If page changes, collapse section accordions
  useEffect(() => {
    setExpandedSection(null);
  }, [page?.id]);

  // Reflect loading status when e.g. the entire survey is being saved
  useEffect(() => {
    setLoading(activeSurveyLoading);
  }, [activeSurveyLoading]);

  return !page ? null : (
    <Fieldset loading={loading}>
      <TextField
        label={tr.EditSurveyPage.name}
        required
        value={page?.title?.[surveyLanguage] ?? ''}
        onChange={(event) => {
          editPage({
            ...page,
            title: { ...page.title, [surveyLanguage]: event.target.value },
          });
        }}
      />
      <Button
        style={{
          display: 'flex',
          position: 'fixed',
          right: '2rem',
          zIndex: 10,
        }}
        disabled={loading}
        color="error"
        variant="contained"
        className={classes.button}
        onClick={() => {
          setDeleteConfirmDialogOpen(true);
        }}
      >
        {tr.EditSurveyPage.deletePage}
      </Button>
      <FormGroup>
        <FormLabel>{tr.EditSurveyPage.selectSidebarType}</FormLabel>
        <ToggleButtonGroup
          color="primary"
          exclusive
          value={page.sidebar.type}
          onChange={(_, newValue) => {
            editPage({
              ...page,
              sidebar: {
                ...page.sidebar,
                type: newValue,
              },
            });
          }}
        >
          <ToggleButton value="none">
            {tr.EditSurveyPage.sidebarType.none}
          </ToggleButton>
          <ToggleButton value="map">
            {tr.EditSurveyPage.sidebarType.map}
          </ToggleButton>
          <ToggleButton value="image">
            {tr.EditSurveyPage.sidebarType.image}
          </ToggleButton>
        </ToggleButtonGroup>
      </FormGroup>
      {page.sidebar.type === 'map' &&
        (!activeSurvey.mapUrl ? (
          <div>{tr.EditSurveyPage.warningNoMapUrl}</div>
        ) : !availableMapLayers.length ? (
          <div>{tr.EditSurveyPage.warningNoAvailableMapLayers}</div>
        ) : (
          <div>
            <FormLabel>{tr.EditSurveyPage.mapLayers}</FormLabel>
            <FormGroup aria-label="map-layers">
              {availableMapLayersLoading && (
                <Skeleton variant="rectangular" height={200} width="100%" />
              )}
              {!availableMapLayersLoading &&
                availableMapLayers.map((layer) => (
                  <FormControlLabel
                    key={layer.id}
                    label={layer.name}
                    control={
                      <Checkbox
                        checked={page.sidebar.mapLayers?.includes(layer.id)}
                        onChange={(event) => {
                          const mapLayers = event.target.checked
                            ? // When adding a new layer, re-sort the array to ensure that
                              // changes are detected correctly (the order won't matter anyway)
                              [...page.sidebar.mapLayers, layer.id].sort()
                            : page.sidebar.mapLayers.filter(
                                (layerId) => layerId !== layer.id,
                              );
                          editPage({
                            ...page,
                            sidebar: {
                              ...page.sidebar,
                              mapLayers,
                            },
                          });
                        }}
                        name={layer.name}
                      />
                    }
                  />
                ))}
            </FormGroup>
          </div>
        ))}
      {page.sidebar.type === 'image' && (
        <div>
          <FileUpload
            surveyId={activeSurvey.id}
            targetPath={[String(activeSurvey.id)]}
            value={
              !page.sidebar.imageName
                ? null
                : [
                    {
                      name: page.sidebar.imageName,
                      path: page.sidebar.imagePath,
                    },
                  ]
            }
            onUpload={({ name, path }) => {
              editPage({
                ...page,
                sidebar: {
                  ...page.sidebar,
                  imagePath: path,
                  imageName: name,
                  imageSize: 'fitted',
                },
              });
            }}
            onDelete={() => {
              editPage({
                ...page,
                sidebar: {
                  ...page.sidebar,
                  imagePath: [],
                  imageName: null,
                  imageSize: null,
                },
              });
            }}
          />
          <TextField
            style={{ width: '100%', marginTop: 2 }}
            label={tr.EditSurveyPage.imageAltText}
            value={page.sidebar?.imageAltText?.[surveyLanguage] ?? ''}
            onChange={(event) => {
              editPage({
                ...page,
                sidebar: {
                  ...page.sidebar,
                  imageAltText: {
                    ...page.sidebar.imageAltText,
                    [surveyLanguage]: event.target.value,
                  },
                },
              });
            }}
          />
          <FormControl sx={{ marginTop: 2 }}>
            <FormLabel>{tr.EditSurveyPage.imageScaling}</FormLabel>
            <RadioGroup
              row
              onChange={(event) =>
                editPage({
                  ...page,
                  sidebar: {
                    ...page.sidebar,
                    imageSize: event.target.value as SurveyPageSidebarImageSize,
                  },
                })
              }
            >
              <FormControlLabel
                sx={{ marginRight: 4 }}
                checked={page.sidebar?.imageSize === 'fitted'}
                value="fitted"
                control={<Radio />}
                label={tr.EditSurveyPage.imageScalingLabel.fitted}
              />
              <FormControlLabel
                checked={page.sidebar?.imageSize === 'original'}
                value="original"
                control={<Radio />}
                label={tr.EditSurveyPage.imageScalingLabel.original}
              />
            </RadioGroup>
          </FormControl>
        </div>
      )}
      <SurveySections
        pageId={page.id}
        sections={page.sections}
        disabled={loading}
        expandedSection={expandedSection}
        onExpandedSectionChange={(section) => {
          setExpandedSection(section);
        }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          marginLeft: '0.5rem',
        }}
      >
        <Fab
          color="secondary"
          sx={{ marginRight: '1rem' }}
          aria-label={'attach-section-from-clipboard'}
          size="small"
          onClick={async () => {
            const res = (await request(
              `/api/surveys/clipboard/section`,
            )) as any;

            console.log(res);
            const section = res.section as SurveyPageSection;
            console.log(section);
            addSection(page.id, { ...section });
          }}
        >
          <ContentPaste />
        </Fab>
        <Typography>{tr.EditSurveyPage.attachSection}</Typography>
      </div>
      <AddSurveySectionActions
        disabled={loading}
        onAdd={(newSection) => {
          addSection(page.id, newSection);
          // Open last section after adding a new one
          setExpandedSection(page.sections.length);
        }}
      />
      <ConfirmDialog
        open={deleteConfirmDialogOpen}
        text={tr.EditSurveyPage.confirmDeletePage}
        submitColor="error"
        onClose={async (result) => {
          setDeleteConfirmDialogOpen(false);
          if (result) {
            setLoading(true);
            try {
              await deletePage(page.id);
              setLoading(false);
            } catch (error) {
              showToast({
                severity: 'error',
                message: tr.EditSurveyPage.deletePageFailed,
              });
              setLoading(false);
              throw error;
            }
          }
        }}
      />
    </Fieldset>
  );
}
