import { SurveyPage } from '@interfaces/survey';
import {
  Divider,
  List,
  ListItem,
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
import CopyToClipboard from '../CopyToClipboard';

function replaceIdsWithNull(obj: any, depth: number) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (obj.hasOwnProperty('id')) {
    obj = { ...obj, id: depth };
  }

  for (const key in obj) {
    if (Array.isArray(obj[key])) {
      for (let i = 0; i < obj[key].length; ++i) {
        obj[key][i] = replaceIdsWithNull(obj[key][i], depth - i);
      }
    } else {
      obj[key] = replaceIdsWithNull(obj[key], depth);
    }
  }

  return obj;
}

function replaceTranslationsWithNull(obj: any) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (obj.hasOwnProperty('en')) {
    obj = { ...obj, en: null };
  }

  for (const key in obj) {
    obj[key] = replaceTranslationsWithNull(obj[key]);
  }

  return obj;
}

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
                            <InsertDriveFileOutlined />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              page.title?.[surveyLanguage] || (
                                <em>{tr.EditSurvey.untitledPage}</em>
                              )
                            }
                          />
                          <CopyToClipboard
                            data={JSON.stringify(page)}
                            tooltip={tr.EditSurvey.copyPage}
                            icon={<ContentCopy />}
                            msg={tr.EditSurvey.pageCopied}
                          />
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
            button
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
          <ListItem
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-around',
            }}
            onClick={async () => {
              setNewPageDisabled(true);
              try {
                const page = await createPage();
                history.push(`${url}/sivut/${page.id}?lang=${language}`);
                setNewPageDisabled(false);
                // Add stuff to newly created page, override with id of newly created blank page
                const text = await navigator.clipboard.readText();
                const surveyPage = JSON.parse(text) as SurveyPage;
                const newSurveyPage = replaceTranslationsWithNull(
                  replaceIdsWithNull(surveyPage, -1),
                );
                console.log({ ...newSurveyPage, id: page.id });
                editPage({ ...newSurveyPage, id: page.id });
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
          </ListItem>
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
