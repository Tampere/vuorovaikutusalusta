import {
  LanguageCode,
  LocalizedText,
  Survey,
  SurveyEmailInfoItem,
} from '@interfaces/survey';
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Typography,
} from '@mui/material';
import { useSurvey } from '@src/stores/SurveyContext';
import { useTranslations } from '@src/stores/TranslationContext';
import React from 'react';
import CopyToClipboard from '../CopyToClipboard';
import Fieldset from '../Fieldset';
import RichTextEditor from '../RichTextEditor';
import EditSurveySectionTranslations from './EditSurveySectionTranslations';
import TranslationField from './TranslationField';
import { Description, TextFields } from '@mui/icons-material';
import { capitalizeFirstLetter } from '@src/utils/strings';

const styles = {
  rowContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: '1rem',
    alignItems: 'center',
    '& .translations-field-icon svg': {
      fill: '#7A7A7A',
    },
  },
  langContainer: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    marginLeft: '0.2rem',
    maxWidth: '36rem',
  },
  pageContainer: {
    marginBottom: '1rem',
  },
  missingTranslation: {
    color: 'red',
  },
  titleText: {
    color: 'grey',
  },
  keyValueContainer: {
    marginTop: '0.5rem',
  },
  boldInput: {
    '& .MuiInputBase-input': {
      fontWeight: 500,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
};

function surveyToTranslationString(survey: Survey) {
  const columnHeaders = 'Label \t fi \t en \n';
  const surveyStrings: string[] = [];

  function isPartialLocalizedText(
    value: unknown,
  ): value is Partial<LocalizedText> {
    return (
      typeof value === 'object' &&
      value !== null &&
      ('fi' in value || 'en' in value)
    );
  }

  function isObject(value: unknown): value is object {
    return !!value && typeof value === 'object';
  }

  function getRowString(
    label: string,
    valueFi: string,
    valueEn: string,
  ): string {
    return `${label} \t ${valueFi ?? ''} \t ${valueEn ?? ''} \n`;
  }

  // Uses recursion to loop through the entire Survey object and to add all values of objects of type LocalizedText to the clipboard
  function addRowString(obj: unknown, label: string, index: number = 0) {
    if (Array.isArray(obj)) {
      index = 1;
      obj.forEach((item) => addRowString(item, `${label}.[${index}]`, index++));
    }
    if (!isObject(obj)) {
      return;
    }

    if (isPartialLocalizedText(obj)) {
      surveyStrings.push(
        getRowString(`${label}`, obj?.fi ?? '', obj?.en ?? ''),
      );
      return;
    }

    Object.entries(obj).forEach(([key, value]) => {
      if (!value) {
        return;
      } else if (Array.isArray(value)) {
        index = 1;
        value.forEach((item) => {
          addRowString(item, `${label}.${key}[${index}]`, index++);
        });
      } else if (typeof value === 'object' && !isPartialLocalizedText(value)) {
        addRowString(value, `${label}.${key}[${index}]`, index);
      } else if (isPartialLocalizedText(value)) {
        surveyStrings.push(getRowString(`${label}.${key}`, value.fi, value.en));
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
    editFollowUpSection,
    editPage,
  } = useSurvey();
  const { tr, languages } = useTranslations();
  const getTranslationPlaceholder = (
    value: string,
    languageCode: LanguageCode,
  ) => `${capitalizeFirstLetter(languageCode).toUpperCase()}: ${value}`;

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
            <Box
              sx={styles.rowContainer}
              style={{ justifyContent: 'flex-start' }}
            >
              <Typography>
                {tr.EditSurveyTranslations.copyTextFields}
              </Typography>
              <CopyToClipboard data={surveyToTranslationString(activeSurvey)} />
            </Box>
            <Typography variant="h5">
              {tr.EditSurveyTranslations.supportedLanguages}:{' '}
            </Typography>
            <Box sx={styles.rowContainer}>
              {languages.map((lang, langIndex) => {
                return (
                  <Box
                    sx={styles.langContainer}
                    key={`lang-container-${langIndex}`}
                  >
                    <Box
                      sx={styles.rowContainer}
                      style={{ justifyContent: 'flex-start' }}
                    >
                      <Typography variant="h6" style={{ fontWeight: 'bold' }}>
                        {tr.EditSurveyTranslations[lang].toLocaleUpperCase()}
                      </Typography>
                    </Box>
                    <br />
                    <Typography sx={styles.titleText}>
                      {langIndex === 0
                        ? tr.EditSurveyTranslations.surveyTitle
                        : ''}{' '}
                      &nbsp;
                    </Typography>
                    <TranslationField
                      variant="outlined"
                      value={activeSurvey.title?.[lang] ?? ''}
                      sx={styles.boldInput}
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
                    <Typography sx={styles.titleText}>
                      {langIndex === 0
                        ? tr.EditSurveyTranslations.surveySubtitle
                        : ''}{' '}
                      &nbsp;
                    </Typography>
                    <TranslationField
                      variant="outlined"
                      sx={styles.boldInput}
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
                        <Typography sx={styles.titleText}>
                          {langIndex === 0
                            ? tr.EditSurveyTranslations.emailInfo
                            : ''}
                          &nbsp;
                        </Typography>
                        <TranslationField
                          placeholder={getTranslationPlaceholder(
                            tr.EditSurveyEmail.emailSubject,
                            lang,
                          )}
                          value={activeSurvey.email.subject?.[lang] ?? ''}
                          variant="outlined"
                          sx={styles.boldInput}
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
                          placeholder={getTranslationPlaceholder(
                            tr.EditSurveyEmail.emailBody,
                            lang,
                          )}
                          value={activeSurvey.email.body?.[lang] ?? ''}
                          missingValue={Boolean(
                            !activeSurvey.email.body?.[lang],
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
                        {activeSurvey?.email?.info?.map(
                          (infoRow: SurveyEmailInfoItem, index: number) => (
                            <Box
                              key={`email-info-${index}`}
                              sx={styles.keyValueContainer}
                            >
                              <TranslationField
                                placeholder={getTranslationPlaceholder(
                                  `${tr.EditSurveyEmail.info}, ${tr.KeyValueForm.key}`,
                                  lang,
                                )}
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
                                placeholder={getTranslationPlaceholder(
                                  `${tr.EditSurveyEmail.info}, ${tr.KeyValueForm.value}`,
                                  lang,
                                )}
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
                            </Box>
                          ),
                        )}
                      </>
                    )}
                    <br />
                    <Typography sx={styles.titleText}>
                      {langIndex === 0
                        ? tr.EditSurveyTranslations.surveyPages
                        : ''}{' '}
                      &nbsp;
                    </Typography>
                    {activeSurvey.pages.map((page, pageIndex) => {
                      return (
                        <div key={`page-container-${pageIndex}`}>
                          <Box
                            display={'flex'}
                            alignItems={'center'}
                            gap="0.5rem"
                            height="2.5rem"
                          >
                            {langIndex === 0 && (
                              <>
                                <Box
                                  sx={(theme) => ({
                                    borderRadius: '50%',
                                    height: '1.5rem',
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    aspectRatio: '1 / 1',
                                    background: theme.palette.primary.main,
                                  })}
                                >
                                  {pageIndex + 1}.
                                </Box>
                                <Typography
                                  sx={{
                                    ...styles.titleText,
                                    marginY: '0.5rem',
                                  }}
                                >
                                  {tr.EditSurveyTranslations.page} &nbsp;
                                </Typography>
                              </>
                            )}
                          </Box>

                          <Box sx={styles.pageContainer}>
                            <TranslationField
                              placeholder={getTranslationPlaceholder(
                                tr.EditSurveyPage.name,
                                lang,
                              )}
                              leftIcon={langIndex === 0 && <Description />}
                              variant="outlined"
                              sx={styles.boldInput}
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
                                placeholder={getTranslationPlaceholder(
                                  tr.EditSurveyPage.imageAltText,
                                  lang,
                                )}
                                leftIcon={langIndex === 0 && <TextFields />}
                                variant="outlined"
                                sx={styles.boldInput}
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
                            <Typography
                              sx={{
                                ...styles.titleText,
                                marginTop: '1rem',
                                marginBottom: '0.5rem',
                              }}
                            >
                              {langIndex === 0
                                ? tr.EditSurveyTranslations.sections
                                : ''}
                              &nbsp;
                            </Typography>
                            {page.sections.map((section, sectionIndex) => (
                              <div key={`survey-section-${sectionIndex}`}>
                                <EditSurveySectionTranslations
                                  hideIcon={langIndex !== 0}
                                  languageCode={lang}
                                  section={section}
                                  onEdit={(editedSection) =>
                                    editSection(
                                      page.id,
                                      sectionIndex,
                                      editedSection,
                                    )
                                  }
                                />
                                {section?.followUpSections?.map(
                                  (followUpSection, index) => (
                                    <EditSurveySectionTranslations
                                      hideIcon={langIndex !== 0}
                                      key={`survey-follow-up-section-${sectionIndex}-${index}`}
                                      languageCode={lang}
                                      section={followUpSection}
                                      onEdit={(editedFollowUpSection) => {
                                        editFollowUpSection(
                                          page.id,
                                          section.id,
                                          editedFollowUpSection,
                                        );
                                      }}
                                    />
                                  ),
                                )}
                              </div>
                            ))}
                          </Box>
                        </div>
                      );
                    })}
                    <>
                      <Typography sx={styles.titleText}>
                        {langIndex === 0
                          ? tr.EditSurveyTranslations.thanksPage
                          : ''}
                        &nbsp;
                      </Typography>
                      <TranslationField
                        placeholder={getTranslationPlaceholder(
                          tr.EditSurveyTranslations.title,
                          lang,
                        )}
                        leftIcon={langIndex === 0 && <TextFields />}
                        sx={styles.boldInput}
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
                        placeholder={getTranslationPlaceholder(
                          tr.EditSurveyThanksPage.text,
                          lang,
                        )}
                        value={activeSurvey.thanksPage.text?.[lang] ?? ''}
                        missingValue={Boolean(
                          !activeSurvey.thanksPage.text?.[lang],
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
                  </Box>
                );
              })}
            </Box>
          </>
        )}
      </Fieldset>
    </>
  );
}
