import {
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Theme,
} from '@mui/material';
import {
  Add,
  ArrowBack,
  DragIndicator,
  FavoriteBorder,
  InfoOutlined,
  InsertDriveFileOutlined,
  Language,
  Mail,
  Preview,
  ContentCopy,
  ContentPaste,
  Quiz,
} from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { useSurvey } from '@src/stores/SurveyContext';
import { useToasts } from '@src/stores/ToastContext';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useHistory, useRouteMatch } from 'react-router-dom';
import ListItemLink from '../ListItemLink';
import SideBar from '../SideBar';

import {
  replaceIdsWithNull,
  replaceTranslationsWithNull,
} from '@src/utils/schemaValidation';
import { useClipboard } from '@src/stores/ClipboardContext';
import { SurveyPage } from '@interfaces/survey';
import { BranchIcon } from '../icons/BranchIcon';

const useStyles = makeStyles((theme: Theme) => ({
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
  },
  disabled: {
    pointerEvents: 'none',
    opacity: 0.4,
  },
  listItemButton: {
    '&:hover': {
      backgroundColor: '#747474',
    },
  },
}));

interface Props {
  width: number;
  mobileOpen: boolean;
  onDrawerToggle: () => void;
}

export default function EditSurveySideBar(props: Props) {
  const [newPageDisabled, setNewPageDisabled] = useState(false);

  const classes = useStyles();
  const history = useHistory();
  const { url } = useRouteMatch();
  const {
    activeSurvey,
    originalActiveSurvey,
    createPage,
    editPage,
    newPageLoading,
    activeSurveyLoading,
    movePage,
  } = useSurvey();
  const { tr, surveyLanguage, language } = useTranslations();
  const { showToast } = useToasts();
  const { clipboardSection, setClipboardPage, clipboardPage } = useClipboard();

  return (
    <SideBar
      width={props.width}
      mobileOpen={props.mobileOpen}
      onDrawerToggle={props.onDrawerToggle}
    >
      <List>
        <ListItemLink external to={`/admin?lang=${language}`}>
          <ListItemIcon>
            <ArrowBack />
          </ListItemIcon>
          <ListItemText primary={tr.EditSurvey.toFrontPage} />
        </ListItemLink>
        <ListItemLink to={`${url}/perustiedot?lang=${language}`}>
          <ListItemIcon>
            <InfoOutlined />
          </ListItemIcon>
          <ListItemText primary={tr.EditSurvey.info} />
        </ListItemLink>
        <ListItemLink to={`${url}/käännökset?lang=${language}`}>
          <ListItemIcon>
            <Language />
          </ListItemIcon>
          <ListItemText primary={tr.EditSurvey.translations}></ListItemText>
        </ListItemLink>
        <ListItemLink to={`${url}/sähköpostit?lang=${language}`}>
          <ListItemIcon>
            <Mail />
          </ListItemIcon>
          <ListItemText primary={tr.EditSurvey.email} />
        </ListItemLink>
      </List>
      <Divider />
      <List>
        <ListItemLink to={`${url}/henkilötiedot`}>
          <ListItemIcon>
            <Quiz />
          </ListItemIcon>
          <ListItemText primary={tr.EditSurvey.surveyInfoPage} />
        </ListItemLink>
        <DragDropContext
          onDragEnd={(event) => {
            if (!event.destination) {
              return;
            }
            movePage(Number(event.draggableId), event.destination.index);
          }}
        >
          <Droppable droppableId="pages">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {activeSurvey.pages.map((page, index) => (
                  <Draggable
                    key={page.id}
                    draggableId={String(page.id)}
                    index={index}
                  >
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps}>
                        <ListItemLink
                          to={`${url}/sivut/${page.id}?lang=${language}`}
                        >
                          <ListItemIcon>
                            {Object.keys(page?.conditions)?.length > 0 && (
                              <BranchIcon />
                            )}
                            <InsertDriveFileOutlined />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              page.title?.[surveyLanguage] || (
                                <em>{tr.EditSurvey.untitledPage}</em>
                              )
                            }
                          />
                          <IconButton
                            onClick={(event) => {
                              event.stopPropagation();
                              event.preventDefault();
                              const copiedSurveyPage =
                                replaceTranslationsWithNull(
                                  replaceIdsWithNull({
                                    ...page,
                                    id: -1,
                                    sidebar: { ...page.sidebar, mapLayers: [] },
                                  }),
                                ) as SurveyPage;

                              // Store section to locale storage for other browser tabs to get access to it
                              localStorage.setItem(
                                'clipboard-content',
                                JSON.stringify({
                                  clipboardPage: {
                                    ...copiedSurveyPage,
                                    conditions: {},
                                  },
                                  clipboardSection,
                                }),
                              );
                              // Store page to context for the currently active browser tab to get access to it
                              setClipboardPage({
                                ...copiedSurveyPage,
                                conditions: {},
                              });
                              showToast({
                                message: tr.EditSurvey.pageCopied,
                                severity: 'success',
                              });
                            }}
                          >
                            <ContentCopy />
                          </IconButton>
                          <div {...provided.dragHandleProps}>
                            <DragIndicator />
                          </div>
                        </ListItemLink>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <ListItem
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-around',
            }}
            className={`${
              newPageDisabled || activeSurveyLoading ? classes.disabled : ''
            } ${newPageLoading ? classes.loading : ''}`}
            onClick={async () => {
              setNewPageDisabled(true);
              try {
                const page = await createPage();
                history.push(`${url}/sivut/${page.id}?lang=${language}`);
                setNewPageDisabled(false);
              } catch (error) {
                showToast({
                  severity: 'error',
                  message: tr.EditSurvey.newPageFailed,
                });
                setNewPageDisabled(false);
                throw error;
              }
            }}
          >
            <ListItemIcon>
              <Add />
            </ListItemIcon>
            <ListItemText primary={tr.EditSurvey.newPage} />
          </ListItem>
          <div
            style={{
              height: '2rem',
              borderRight: '1px solid white',
              alignSelf: 'center',
            }}
          ></div>
          <ListItemButton
            className={classes.listItemButton}
            disabled={!clipboardPage}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-around',
              width: '100%',
            }}
            onClick={async () => {
              setNewPageDisabled(true);
              try {
                // Create new blank page and set its contents from Clipboard -context
                const blankPage = await createPage();
                history.push(`${url}/sivut/${blankPage.id}?lang=${language}`);
                setNewPageDisabled(false);

                editPage({ ...clipboardPage, id: blankPage.id });
                showToast({
                  severity: 'warning',
                  message: tr.EditSurvey.pageAttached,
                  autoHideDuration: 30000,
                });
              } catch (error) {
                showToast({
                  severity: 'error',
                  message: tr.EditSurvey.newPageFailed,
                });
                setNewPageDisabled(false);
                throw error;
              }
            }}
          >
            <ContentPaste />
            {tr.EditSurvey.attachNewPage}
          </ListItemButton>
        </div>
      </List>
      <Divider />
      <List>
        <ListItemLink to={`${url}/kiitos-sivu?lang=${language}`}>
          <ListItemIcon>
            <FavoriteBorder />
          </ListItemIcon>
          <ListItemText primary={tr.EditSurvey.thanksPage} />
        </ListItemLink>
        <ListItemLink
          external
          newTab
          to={`/${originalActiveSurvey.name}${
            originalActiveSurvey?.localisationEnabled
              ? '?lang=' + surveyLanguage
              : ''
          }`}
        >
          <ListItemIcon>
            <Preview />
          </ListItemIcon>
          <ListItemText primary={tr.EditSurvey.toSurveyPage} />
        </ListItemLink>
      </List>
    </SideBar>
  );
}
