import { SurveyPersonalInfoQuestion } from '@interfaces/survey';
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
  IconButton,
  Input,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslations } from '@src/stores/TranslationContext';
import { Check } from '@mui/icons-material';
import React, { Fragment } from 'react';

interface Props {
  section: SurveyPersonalInfoQuestion;
  onChange: (section: SurveyPersonalInfoQuestion) => void;
}

const inputStyle = {
  maxWidth: '600px',
  border: 'none',
  height: '28px',
  fontSize: '1rem',
};

const checkedIcon = (
  <span
    style={{
      backgroundColor: 'white',
      width: '28px',
      height: '28px',
      borderRadius: '4px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Check fontSize="medium" />
  </span>
);

const uncheckedIcon = (
  <span
    style={{
      backgroundColor: 'white',
      width: '28px',
      height: '28px',
      borderRadius: '4px',
    }}
  />
);

export function EditPersonalInfoQuestion({ section, onChange }: Props) {
  const { tr, surveyLanguage, initializeLocalizedObject } = useTranslations();

  return (
    <>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              name="is-required"
              checked={section.isRequired}
              onChange={(event) => {
                onChange({
                  ...section,
                  isRequired: event.target.checked,
                });
              }}
            />
          }
          label={tr.SurveySections.isRequired}
        />

        <FormLabel
          component="p"
          sx={{
            fontWeight: 700,
            fontSize: '16px',
            marginBottom: '8px',
          }}
        >
          {tr.PersonalInfoQuestion.label}
        </FormLabel>
        <FormControlLabel
          sx={{ marginLeft: '-9px' }}
          control={
            <Checkbox
              name="name"
              size="large"
              checkedIcon={checkedIcon}
              icon={uncheckedIcon}
              checked={section.askName}
              onChange={(event) => {
                onChange({
                  ...section,
                  askName: event.target.checked,
                });
              }}
            />
          }
          label={tr.PersonalInfoQuestion.nameLabel}
        />
        <FormControlLabel
          sx={{ marginLeft: '-9px' }}
          control={
            <Checkbox
              name="email"
              size="large"
              checkedIcon={checkedIcon}
              icon={uncheckedIcon}
              checked={section.askEmail}
              onChange={(event) => {
                onChange({
                  ...section,
                  askEmail: event.target.checked,
                });
              }}
            />
          }
          label={tr.PersonalInfoQuestion.emailLabel}
        />
        <FormControlLabel
          sx={{ marginLeft: '-9px' }}
          control={
            <Checkbox
              name="phone"
              size="large"
              checkedIcon={checkedIcon}
              icon={uncheckedIcon}
              checked={section.askPhone}
              onChange={(event) => {
                onChange({
                  ...section,
                  askPhone: event.target.checked,
                });
              }}
            />
          }
          label={tr.PersonalInfoQuestion.phoneLabel}
        />
        <FormControlLabel
          sx={{ marginLeft: '-9px' }}
          control={
            <Checkbox
              name="address"
              size="large"
              checkedIcon={checkedIcon}
              icon={uncheckedIcon}
              checked={section.askAddress}
              onChange={(event) => {
                onChange({
                  ...section,
                  askAddress: event.target.checked,
                });
              }}
            />
          }
          label={tr.PersonalInfoQuestion.addressLabel}
        />
        {section.customQuestions.map((cq, idx) => {
          return (
            <Fragment key={idx}>
              <FormControlLabel
                key={idx}
                sx={{ marginLeft: '-9px' }}
                control={
                  <Checkbox
                    data-testid="custom-checkbox"
                    name="customText"
                    size="large"
                    checkedIcon={checkedIcon}
                    icon={uncheckedIcon}
                    checked={Boolean(cq.ask)}
                    disabled={cq.label[surveyLanguage] === ''}
                    onChange={(event) => {
                      onChange({
                        ...section,
                        customQuestions: section.customQuestions.map(
                          (prev, prevIdx) => {
                            if (idx !== prevIdx) return prev;
                            return {
                              ...prev,
                              ask: event.target.checked,
                            };
                          },
                        ),
                      });
                    }}
                  />
                }
                label={
                  <>
                    <Input
                      value={cq.label?.[surveyLanguage] ?? ''}
                      style={inputStyle}
                      placeholder={tr.PersonalInfoQuestion.customQuestion}
                      onChange={(e) => {
                        const newQuestions = section.customQuestions.map(
                          (prev, prevIdx) => {
                            if (prevIdx !== idx) return prev;
                            return {
                              ...prev,
                              label: {
                                ...prev.label,
                                [surveyLanguage]: e.target.value,
                              },
                            };
                          },
                        );

                        // Add new input row if there are no empty rows anymore
                        if (
                          newQuestions.filter(
                            (e) => e.label[surveyLanguage].length === 0,
                          ).length <= 0
                        )
                          newQuestions.push({
                            ask: false,
                            label: initializeLocalizedObject(''),
                          });

                        onChange({ ...section, customQuestions: newQuestions });
                      }}
                    />
                    {cq.label[surveyLanguage] !== '' && (
                      <IconButton
                        onClick={() =>
                          onChange({
                            ...section,
                            customQuestions: section.customQuestions.filter(
                              (rq) => cq !== rq,
                            ),
                          })
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </>
                }
              />
            </Fragment>
          );
        })}
      </FormGroup>
    </>
  );
}
