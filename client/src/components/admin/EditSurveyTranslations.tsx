import { Survey, SurveyEmailInfoItem } from '@interfaces/survey';
import {
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useSurvey } from '@src/stores/SurveyContext';
import { useTranslations } from '@src/stores/TranslationContext';
import React from 'react';
import CopyToClipboard from '../CopyToClipboard';
import Fieldset from '../Fieldset';
import RichTextEditor from '../RichTextEditor';
import EditSurveySectionTranslations from './EditSurveySectionTranslations';
import TranslationField from './TranslationField';

const useStyles = makeStyles({
  rowContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  langContainer: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    marginLeft: '0.2rem',
  },
  pageContainer: {
    padding: '1rem',
    marginBottom: '1rem',
    border: '2px dashed lightgrey',
    borderRadius: '0.5rem',
  },
  missingTranslation: {
    color: 'red',
  },
  titleText: {
    color: 'grey',
  },
  keyValueContainer: {
    padding: '1rem',
    marginTop: '0.5rem',
    border: '1px solid lightgrey',
    borderRadius: '0.5rem',
  },
});

function surveyToTranslationString(survey: Survey) {
  const columnHeaders = 'Label \t fi \t en \n';
  const surveyStrings: string[] = [];

  function isLocalizedText(value: unknown): value is LocalizedText {
    return (
      typeof value === 'object' &&
      value !== null &&
      'fi' in value &&
      'en' in value
    );
  }

  function getRowString(
    label: string,
    valueFi: string,
    valueEn: string
  ): string {
    return `${label} \t ${valueFi} \t ${valueEn} \n`;
  }
  // Uses recursion to loop through the entire Survey object and to add all values of objects of type LocalizedText to the clipboard
  function addRowString(obj: any, label: string, index: number = 0) {
    Object.keys(obj).forEach((key: string) => {
      if (!obj[key]) {
        return;
      } else if (Array.isArray(obj[key])) {
        index = 1;
        obj[key].forEach((array: [any]) =>
          addRowString(array, `${label}.${key}[${index}]`, index++)
        );
      } else if (typeof obj[key] === 'object' && !isLocalizedText(obj[key])) {
        addRowString(obj[key], `${label}.${key}[${index}]`, index);
      } else if (isLocalizedText(obj[key])) {
        surveyStrings.push(
          getRowString(`${label}.${key}`, obj[key].fi, obj[key].en)
        );
      }
    });
  }

  addRowString(survey, 'Survey');
  return [columnHeaders, ...surveyStrings].join('');
}

export default function EditSurveyTranslations() {
  const {
    activeSurvey,
    activeSurveyLoading,
    editSurvey,
    editSection,
    editPage,
  } = useSurvey();
  const { tr, languages } = useTranslations();
  const classes = useStyles();

  return (
    <>
      <Fieldset loading={activeSurveyLoading}>
        <div>
          <FormControlLabel
            control={
              <Checkbox
                name="email-enabled"
                disabled={activeSurveyLoading}
                checked={activeSurvey.localisationEnabled ?? false}
                onChange={(event) => {
                  editSurvey({
                    ...activeSurvey,
                    localisationEnabled: event.target.checked,
                  });
                }}
              />
            }
            label={tr.EditSurveyTranslations.enableLocalisation}
          />
          <FormHelperText>
            {tr.EditSurveyTranslations.provideTranslations}
          </FormHelperText>
        </div>
        {activeSurvey.localisationEnabled && (
          <>
            <div
              className={classes.rowContainer}
              style={{ justifyContent: 'flex-start' }}
            >
              <Typography>
                {tr.EditSurveyTranslations.copyTextFields}
              </Typography>
              <CopyToClipboard data={surveyToTranslationString(activeSurvey)} />
            </div>
            <Typography variant="h5">
              {tr.EditSurveyTranslations.supportedLanguages}:{' '}
            </Typography>
            <div className={classes.rowContainer}>
              {languages.map((lang, langIndex) => {
                return (
                  <div
                    className={classes.langContainer}
                    key={`lang-container-${langIndex}`}
                  >
                    <div
                      className={classes.rowContainer}
                      style={{ justifyContent: 'flex-start' }}
                    >
                      <Typography variant="h6" style={{ fontWeight: 'bold' }}>
                        {tr.EditSurveyTranslations[lang].toLocaleUpperCase()}
                      </Typography>
                    </div>
                    <br />
                    <Typography className={classes.titleText}>
                      {langIndex === 0
                        ? tr.EditSurveyTranslations.surveyTitle
                        : ''}{' '}
                      &nbsp;
                    </Typography>
                    <TranslationField
                      variant="standard"
                      value={activeSurvey.title?.[lang] ?? ''}
                      onChange={(event) => {
                        editSurvey({
                          ...activeSurvey,
                          title: {
                            ...activeSurvey.title,
                            [lang]: event.target.value,
                          },
                        });
                      }}
                    />
                    <Typography className={classes.titleText}>
                      {langIndex === 0
                        ? tr.EditSurveyTranslations.surveySubtitle
                        : ''}{' '}
                      &nbsp;
                    </Typography>
                    <TranslationField
                      variant="standard"
                      value={activeSurvey.subtitle?.[lang] ?? ''}
                      onChange={(event) => {
                        editSurvey({
                          ...activeSurvey,
                          subtitle: {
                            ...activeSurvey.subtitle,
                            [lang]: event.target.value,
                          },
                        });
                      }}
                    />
                    {activeSurvey.email.enabled && (
                      <>
                        <br />
                        <Typography className={classes.titleText}>
                          {langIndex === 0
                            ? tr.EditSurveyTranslations.emailInfo
                            : ''}
                          &nbsp;
                        </Typography>
                        <TranslationField
                          value={activeSurvey.email.subject?.[lang] ?? ''}
                          onChange={(event) =>
                            editSurvey({
                              ...activeSurvey,
                              email: {
                                ...activeSurvey.email,
                                subject: {
                                  ...activeSurvey.email.subject,
                                  [lang]: event.target.value,
                                },
                              },
                            })
                          }
                        />
                        <RichTextEditor
                          value={activeSurvey.email.body?.[lang] ?? ''}
                          missingValue={Boolean(
                            !activeSurvey.email.body?.[lang]
                          )}
                          onChange={(value) =>
                            editSurvey({
                              ...activeSurvey,
                              email: {
                                ...activeSurvey.email,
                                body: {
                                  ...activeSurvey.email.body,
                                  [lang]: value,
                                },
                              },
                            })
                          }
                          editorHeight={'100px'}
                        />
                        {activeSurvey.email.info.map(
                          (infoRow: SurveyEmailInfoItem, index) => (
                            <div
                              key={`email-info-${index}`}
                              className={classes.keyValueContainer}
                            >
                              <TranslationField
                                variant="standard"
                                color="primary"
                                value={infoRow.name?.[lang] ?? ''}
                                onChange={(event) => {
                                  const updatedInfoRow = {
                                    ...infoRow,
                                    name: {
                                      ...infoRow.name,
                                      [lang]: event.target.value,
                                    },
                                  };
                                  const infoRows = [...activeSurvey.email.info];
                                  infoRows[index] = updatedInfoRow;
                                  editSurvey({
                                    ...activeSurvey,
                                    email: {
                                      ...activeSurvey.email,
                                      info: infoRows,
                                    },
                                  });
                                }}
                              />
                              <TranslationField
                                variant="standard"
                                color="primary"
                                value={infoRow.value?.[lang] ?? ''}
                                onChange={(event) => {
                                  const updatedInfoRow = {
                                    ...infoRow,
                                    value: {
                                      ...infoRow.value,
                                      [lang]: event.target.value,
                                    },
                                  };
                                  const infoRows = [...activeSurvey.email.info];
                                  infoRows[index] = updatedInfoRow;
                                  editSurvey({
                                    ...activeSurvey,
                                    email: {
                                      ...activeSurvey.email,
                                      info: infoRows,
                                    },
                                  });
                                }}
                              />
                            </div>
                          )
                        )}
                      </>
                    )}
                    <br />
                    <Typography className={classes.titleText}>
                      {langIndex === 0
                        ? tr.EditSurveyTranslations.surveyPages
                        : ''}{' '}
                      &nbsp;
                    </Typography>
                    {activeSurvey.pages.map((page, pageIndex) => {
                      return (
                        <div key={`page-container-${pageIndex}`}>
                          <Typography className={classes.titleText}>
                            {langIndex === 0
                              ? `${pageIndex + 1}. ${
                                  tr.EditSurveyTranslations.page
                                }`
                              : ''}
                            &nbsp;
                          </Typography>
                          <div className={classes.pageContainer}>
                            <TranslationField
                              variant="standard"
                              color="primary"
                              value={page.title?.[lang] ?? ''}
                              onChange={(event) =>
                                editPage({
                                  ...page,
                                  title: {
                                    ...page.title,
                                    [lang]: event.target.value,
                                  },
                                })
                              }
                            />
                            {page.sidebar.type == 'image' && (
                              <TranslationField
                                variant="standard"
                                color="primary"
                                value={page.sidebar?.imageAltText?.[lang] ?? ''}
                                onChange={(event) =>
                                  editPage({
                                    ...page,
                                    sidebar: {
                                      ...page.sidebar,
                                      imageAltText: {
                                        ...page.sidebar.imageAltText,
                                        [lang]: event.target.value,
                                      },
                                    },
                                  })
                                }
                              />
                            )}
                            {page.sections.map((section, sectionIndex) => (
                              <EditSurveySectionTranslations
                                key={`survey-section-${sectionIndex}`}
                                languageCode={lang}
                                section={section}
                                onEdit={(editedSection) =>
                                  editSection(
                                    page.id,
                                    sectionIndex,
                                    editedSection
                                  )
                                }
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    <>
                      <Typography className={classes.titleText}>
                        {langIndex === 0
                          ? tr.EditSurveyTranslations.thanksPage
                          : ''}
                        &nbsp;
                      </Typography>
                      <TranslationField
                        value={activeSurvey.thanksPage.title?.[lang] ?? ''}
                        onChange={(event) =>
                          editSurvey({
                            ...activeSurvey,
                            thanksPage: {
                              ...activeSurvey.thanksPage,
                              title: {
                                ...activeSurvey.thanksPage.title,
                                [lang]: event.target.value,
                              },
                            },
                          })
                        }
                      />
                      <RichTextEditor
                        value={activeSurvey.thanksPage.text?.[lang] ?? ''}
                        missingValue={Boolean(
                          !activeSurvey.thanksPage.text?.[lang]
                        )}
                        onChange={(value) =>
                          editSurvey({
                            ...activeSurvey,
                            thanksPage: {
                              ...activeSurvey.thanksPage,
                              text: {
                                ...activeSurvey.thanksPage.text,
                                [lang]: value,
                              },
                            },
                          })
                        }
                        editorHeight={'100px'}
                      />
                    </>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Fieldset>
    </>
  );
}
