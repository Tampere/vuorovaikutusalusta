import {
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Theme,
} from '@material-ui/core';
import {
  AddCircle,
  ArrowBack,
  DragIndicator,
  FavoriteBorder,
  InfoOutlined,
  InsertDriveFileOutlined,
  Preview,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { useSurvey } from '@src/stores/SurveyContext';
import { useToasts } from '@src/stores/ToastContext';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useHistory, useRouteMatch } from 'react-router-dom';
import ListItemLink from '../ListItemLink';
import SideBar from '../SideBar';

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
    newPageLoading,
    activeSurveyLoading,
    movePage,
  } = useSurvey();
  const { tr } = useTranslations();
  const { showToast } = useToasts();

  return (
    <SideBar
      width={props.width}
      mobileOpen={props.mobileOpen}
      onDrawerToggle={props.onDrawerToggle}
    >
      <List>
        <ListItemLink external to={'/admin'}>
          <ListItemIcon>
            <ArrowBack />
          </ListItemIcon>
          <ListItemText primary={tr.EditSurvey.toFrontPage} />
        </ListItemLink>
        <ListItemLink to={`${url}/perustiedot`}>
          <ListItemIcon>
            <InfoOutlined />
          </ListItemIcon>
          <ListItemText primary={tr.EditSurvey.info} />
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
                        <ListItemLink to={`${url}/sivut/${page.id}`}>
                          <ListItemIcon>
                            <InsertDriveFileOutlined />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              page.title || (
                                <em>{tr.EditSurvey.untitledPage}</em>
                              )
                            }
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
        <ListItem
          button
          className={`${
            newPageDisabled || activeSurveyLoading ? classes.disabled : ''
          } ${newPageLoading ? classes.loading : ''}`}
          onClick={async () => {
            setNewPageDisabled(true);
            try {
              const page = await createPage();
              history.push(`${url}/sivut/${page.id}`);
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
            <AddCircle />
          </ListItemIcon>
          <ListItemText primary={tr.EditSurvey.newPage} />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItemLink to={`${url}/kiitos-sivu`}>
          <ListItemIcon>
            <FavoriteBorder />
          </ListItemIcon>
          <ListItemText primary={tr.EditSurvey.thanksPage} />
        </ListItemLink>
        <ListItemLink external newTab to={`/${originalActiveSurvey.name}`}>
          <ListItemIcon>
            <Preview />
          </ListItemIcon>
          <ListItemText primary={tr.EditSurvey.toSurveyPage} />
        </ListItemLink>
      </List>
    </SideBar>
  );
}
