import { SurveyGroupedCheckboxQuestion } from '@interfaces/survey';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Fab,
  TextField,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@material-ui/core';
import { Add, ExpandMore } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { useState } from 'react';
import QuestionOptions from './QuestionOptions';

interface Props {
  section: SurveyGroupedCheckboxQuestion;
  disabled?: boolean;
  onChange: (section: SurveyGroupedCheckboxQuestion) => void;
}

const useStyles = makeStyles({
  accordion: {
    background: '#bbb',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  answerLimitInput: {
    marginRight: '1rem',
  },
});

export default function EditGroupedCheckBoxQuestion({
  section,
  disabled,
  onChange,
}: Props) {
  const [openedGroupId, setOpenedGroupId] = useState<number>(null);

  const { tr, language } = useTranslations();
  const classes = useStyles();

  return (
    <>
      <FormGroup row>
        <FormControlLabel
          control={
            <Checkbox
              name="limit-answers"
              disabled={disabled}
              checked={Boolean(section.answerLimits)}
              onChange={(event) => {
                onChange({
                  ...section,
                  answerLimits: event.target.checked
                    ? {
                        min: null,
                        max: null,
                      }
                    : null,
                });
              }}
            />
          }
          label={tr.SurveySections.limitAnswers}
        />
      </FormGroup>
      {section.answerLimits && (
        <FormGroup row>
          <TextField
            id="min-answers"
            disabled={disabled}
            className={classes.answerLimitInput}
            type="number"
            variant="standard"
            label={tr.SurveySections.minAnswers}
            InputLabelProps={{ shrink: true }}
            value={section.answerLimits?.min ?? ''}
            onChange={(event) => {
              // Negative numbers shouldn't be allowed
              const value = Math.max(Number(event.target.value), 0);
              onChange({
                ...section,
                answerLimits: {
                  ...section.answerLimits,
                  min: Math.min(value, section.answerLimits.max),
                },
              });
            }}
          />
          <TextField
            id="max-answers"
            disabled={disabled}
            type="number"
            variant="standard"
            label={tr.SurveySections.maxAnswers}
            InputLabelProps={{ shrink: true }}
            value={section.answerLimits?.max ?? ''}
            onChange={(event) => {
              // Negative numbers shouldn't be allowed
              const value = Math.max(Number(event.target.value), 0);
              onChange({
                ...section,
                answerLimits: {
                  ...section.answerLimits,
                  max: Math.max(value, section.answerLimits.min),
                },
              });
            }}
          />
        </FormGroup>
      )}
      <div>
        {section.groups.map((group, index) => (
          <Accordion
            key={group.id}
            className={classes.accordion}
            expanded={openedGroupId === group.id}
            onChange={(_, isExpanded) => {
              setOpenedGroupId(isExpanded ? group.id : null);
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-controls={`group-${index}-content`}
              id={`group-${index}-header`}
            >
              <Typography>
                {group.name[language] || (
                  <em>{tr.EditGroupedCheckBoxQuestion.untitledGroup}</em>
                )}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.group}>
              <TextField
                autoFocus
                disabled={disabled}
                label={tr.EditGroupedCheckBoxQuestion.groupName}
                value={group.name[language]}
                variant="standard"
                onChange={(event) => {
                  group.name[language] = event.target.value;
                  onChange({
                    ...section,
                  });
                  // props.onEdit({ ...props.section, title: event.target.value });
                }}
              />
              <QuestionOptions
                options={group.options}
                disabled={disabled}
                onChange={(options) => {
                  group.options = [...options];
                  onChange({ ...section });
                }}
                title={tr.SurveySections.options}
                allowOptionInfo
                enableClipboardImport
              />
              <div>
                <Button
                  variant="contained"
                  disabled={disabled}
                  onClick={() => {
                    // setDeleteConfirmDialogOpen(true);
                    console.log('aaa');
                    onChange({
                      ...section,
                      groups: section.groups.filter((_, i) => i !== index),
                    });
                  }}
                >
                  {tr.EditGroupedCheckBoxQuestion.deleteGroup}
                </Button>
              </div>
            </AccordionDetails>
          </Accordion>
        ))}
      </div>
      <div className={classes.row}>
        <Fab
          color="primary"
          disabled={disabled}
          aria-label="add-checkbox-group"
          size="small"
          onClick={() => {
            // Add a temporary new ID for the group
            const id =
              Math.min(0, ...section.groups.map((group) => group.id)) - 1;
            onChange({
              ...section,
              groups: [
                ...section.groups,
                {
                  id,
                  name: { fi: '' },
                  options: [],
                },
              ],
            });
            setOpenedGroupId(id);
          }}
        >
          <Add />
        </Fab>
        <Typography style={{ paddingLeft: '1rem' }}>
          {tr.EditGroupedCheckBoxQuestion.addGroup}
        </Typography>
      </div>
    </>
  );
}
