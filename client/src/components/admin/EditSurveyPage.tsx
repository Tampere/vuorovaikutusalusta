import {
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Skeleton,
  TextField,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useSurvey } from '@src/stores/SurveyContext';
import { useToasts } from '@src/stores/ToastContext';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import ConfirmDialog from '../ConfirmDialog';
import Fieldset from '../Fieldset';
import AddSurveySectionActions from './AddSurveySectionActions';
import SurveySections from './SurveySections';

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
  const { surveyId, pageId } =
    useParams<{ surveyId: string; pageId: string }>();
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
  const { tr } = useTranslations();
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
        value={page.title}
        onChange={(event) => {
          editPage({
            ...page,
            title: event.target.value,
          });
        }}
      />
      <Button
        disabled={loading}
        variant="contained"
        className={classes.button}
        onClick={() => {
          setDeleteConfirmDialogOpen(true);
        }}
      >
        {tr.EditSurveyPage.deletePage}
      </Button>
      {activeSurvey.mapUrl && availableMapLayers.length > 0 && (
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
                      checked={page.mapLayers?.includes(layer.id)}
                      onChange={(event) => {
                        const mapLayers = event.target.checked
                          ? // When adding a new layer, re-sort the array to ensure that
                            // changes are detected correctly (the order won't matter anyway)
                            [...page.mapLayers, layer.id].sort()
                          : page.mapLayers.filter(
                              (layerId) => layerId !== layer.id
                            );
                        editPage({
                          ...page,
                          mapLayers,
                        });
                      }}
                      name={layer.name}
                    />
                  }
                />
              ))}
          </FormGroup>
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
