import {
  LanguageCode,
  SectionOption,
  SurveyMapSubQuestion,
  SurveyPageSection,
} from '@interfaces/survey';
import { useTranslations } from '@src/stores/TranslationContext';
import React from 'react';
import RichTextEditor from '../RichTextEditor';
import TranslationField from './TranslationField';
import Box from '@mui/material/Box';

const styles = {
  sectionContainer: {
    border: '2px solid grey',
    padding: '1rem',
    marginBottom: '1rem',
  },
  titleText: {
    color: 'grey',
  },
};

interface Props {
  section: SurveyPageSection;
  languageCode: LanguageCode;
  onEdit: (section: SurveyPageSection) => void;
}

export default function EditSurveySectionTranslations({
  section,
  languageCode,
  onEdit,
}: Props) {
  const { languages } = useTranslations();

  return (
    <Box sx={styles.sectionContainer}>
      <TranslationField
        variant="standard"
        value={section.title?.[languageCode] ?? ''}
        onChange={(event) => {
          onEdit({
            ...section,
            title: { ...section.title, [languageCode]: event.target.value },
          });
        }}
      />
      {(section.type === 'checkbox' ||
        section.type === 'radio' ||
        section.type === 'sorting') &&
        section.options?.map((option: SectionOption, optionIndex) => (
          <TranslationField
            key={`option-field-${optionIndex}`}
            value={option.text[languageCode]}
            onChange={(event) => {
              const updatedOptions = [...section.options];
              updatedOptions[optionIndex] = {
                ...updatedOptions[optionIndex],
                text: {
                  ...option.text,
                  [languageCode]: event.target.value,
                },
              };
              onEdit({ ...section, options: updatedOptions });
            }}
          />
        ))}
      {section.type === 'grouped-checkbox' && (
        <div>
          {section.groups.map((group, groupIndex) => {
            return (
              <div key={`group-index=${groupIndex}`}>
                <TranslationField
                  value={group.name[languageCode] ?? ''}
                  onChange={(event) => {
                    const updatedGroups = [...section.groups];
                    updatedGroups[groupIndex].name = {
                      ...updatedGroups[groupIndex].name,
                      [languageCode]: event.target.value,
                    };
                    onEdit({ ...section, groups: updatedGroups });
                  }}
                />
                {group.options.map((option, optionIndex) => (
                  <div key={`option-index-${optionIndex}`}>
                    <TranslationField
                      value={option.text[languageCode] ?? ''}
                      onChange={(event) => {
                        const updatedGroups = [...section.groups];
                        const updatedOptions = [...group.options];
                        updatedOptions[optionIndex].text = {
                          ...updatedOptions[optionIndex].text,
                          [languageCode]: event.target.value,
                        };
                        updatedGroups[groupIndex].options = updatedOptions;
                        onEdit({ ...section, groups: updatedGroups });
                      }}
                    />
                    {languages
                      .map((supportedLanguage) =>
                        Boolean(option.info?.[supportedLanguage]),
                      )
                      .includes(true) && (
                      <div
                        style={{
                          wordBreak: 'break-word',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          position: 'relative',
                        }}
                      >
                        <RichTextEditor
                          value={option.info?.[languageCode]}
                          missingValue={Boolean(!option.info?.[languageCode])}
                          onChange={(value) => {
                            const updatedGroups = [...section.groups];
                            const updatedOptions = [...group.options];
                            updatedOptions[optionIndex].info = {
                              ...updatedOptions[optionIndex].info,
                              [languageCode]: value,
                            };
                            updatedGroups[groupIndex].options = updatedOptions;
                            onEdit({ ...section, groups: updatedGroups });
                          }}
                          editorHeight={'100px'}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
      {section.type === 'categorized-checkbox' && (
        <div>
          {section.categoryGroups.map((group, groupIndex) => {
            return (
              <div key={`group-index=${groupIndex}`}>
                <TranslationField
                  value={group.name[languageCode] ?? ''}
                  onChange={(event) => {
                    const updatedGroups = [...section.categoryGroups];
                    updatedGroups[groupIndex].name = {
                      ...updatedGroups[groupIndex].name,
                      [languageCode]: event.target.value,
                    };
                    onEdit({ ...section, categoryGroups: updatedGroups });
                  }}
                />
                {group.categories.map((category, optionIndex) => (
                  <div key={`option-index-${optionIndex}`}>
                    <TranslationField
                      value={category.name[languageCode] ?? ''}
                      onChange={(event) => {
                        const updatedGroups = [...section.categoryGroups];
                        const updatedCategories = [...group.categories];
                        updatedCategories[optionIndex].name = {
                          ...updatedCategories[optionIndex].name,
                          [languageCode]: event.target.value,
                        };
                        updatedGroups[groupIndex].categories =
                          updatedCategories;
                        onEdit({ ...section, categoryGroups: updatedGroups });
                      }}
                    />
                  </div>
                ))}
              </div>
            );
          })}
          {section.options.map((option, optionIndex) => (
            <div key={`option-index-${optionIndex}`}>
              <TranslationField
                value={option.text[languageCode] ?? ''}
                onChange={(event) => {
                  const updatedOptions = [...section.options];
                  updatedOptions[optionIndex].text = {
                    ...updatedOptions[optionIndex].text,
                    [languageCode]: event.target.value,
                  };
                  onEdit({ ...section, options: updatedOptions });
                }}
              />
              {languages
                .map((supportedLanguage) =>
                  Boolean(option.info?.[supportedLanguage]),
                )
                .includes(true) && (
                <div
                  style={{
                    wordBreak: 'break-word',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    position: 'relative',
                  }}
                >
                  <RichTextEditor
                    value={option.info?.[languageCode]}
                    missingValue={Boolean(!option.info?.[languageCode])}
                    onChange={(value) => {
                      const updatedOptions = [...section.options];
                      updatedOptions[optionIndex].info = {
                        ...updatedOptions[optionIndex].info,
                        [languageCode]: value,
                      };
                      onEdit({ ...section, options: updatedOptions });
                    }}
                    editorHeight={'100px'}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {section.type === 'slider' && (section.maxLabel || section.minLabel) && (
        <div>
          <TranslationField
            value={section.minLabel?.[languageCode]}
            onChange={(event) =>
              onEdit({
                ...section,
                minLabel: {
                  ...section.minLabel,
                  [languageCode]: event.target.value,
                },
              })
            }
          />
          <TranslationField
            value={section.maxLabel?.[languageCode]}
            onChange={(event) =>
              onEdit({
                ...section,
                maxLabel: {
                  ...section.maxLabel,
                  [languageCode]: event.target.value,
                },
              })
            }
          />
        </div>
      )}
      {(section.type === 'matrix' || section.type === 'multi-matrix') && (
        <div>
          {section.classes &&
            section.classes.map((matrixClass, classIndex) => (
              <TranslationField
                key={`matrix-class-${classIndex}`}
                value={matrixClass[languageCode] ?? ''}
                onChange={(event) => {
                  const updatedClasses = [...section.classes];
                  updatedClasses[classIndex] = {
                    ...matrixClass,
                    [languageCode]: event.target.value,
                  };
                  onEdit({ ...section, classes: updatedClasses });
                }}
              />
            ))}
          {section.subjects &&
            section.subjects.map((matrixSubject, subjectIndex) => (
              <TranslationField
                key={`matrix-subject-${subjectIndex}`}
                value={matrixSubject[languageCode] ?? ''}
                onChange={(event) => {
                  const updatedSubjects = [...section.subjects];
                  updatedSubjects[subjectIndex] = {
                    ...matrixSubject,
                    [languageCode]: event.target.value,
                  };
                  onEdit({ ...section, subjects: updatedSubjects });
                }}
              />
            ))}
        </div>
      )}
      {section.type === 'map' &&
        section.subQuestions?.map((subquestion, questionIndex) => (
          <EditSurveySectionTranslations
            key={`subquestion-index-${questionIndex}`}
            languageCode={languageCode}
            onEdit={(updatedSubquestion: SurveyMapSubQuestion) => {
              const updatedSubquestions = [...section.subQuestions];
              updatedSubquestions[questionIndex] = updatedSubquestion;
              onEdit({ ...section, subQuestions: updatedSubquestions });
            }}
            section={subquestion}
          />
        ))}
      {section.type === 'text' && (
        <>
          <RichTextEditor
            value={section.body?.[languageCode]}
            missingValue={Boolean(!section.body?.[languageCode])}
            onChange={(value) => {
              onEdit({
                ...section,
                body: { ...section.body, [languageCode]: value },
              });
            }}
            editorHeight={'100px'}
          ></RichTextEditor>
          <br />
        </>
      )}
      {section.type === 'image' && (
        <TranslationField
          value={section.altText[languageCode] ?? ''}
          onChange={(event) => {
            onEdit({
              ...section,
              altText: {
                ...section.altText,
                [languageCode]: event.target.value,
              },
            });
          }}
        />
      )}
      {section.type === 'personal-info' &&
        section.customQuestions.map((question, idx) => (
          <TranslationField
            key={`${question.label}-${idx}`}
            value={question.label?.[languageCode] ?? ''}
            onChange={(event) => {
              onEdit({
                ...section,
                customQuestions: section.customQuestions.map(
                  (customQuestion, customQuestionIdx) =>
                    customQuestionIdx === idx
                      ? {
                          ...customQuestion,
                          label: {
                            ...customQuestion.label,
                            [languageCode]: event.target.value,
                          },
                        }
                      : customQuestion,
                ),
              });
            }}
          />
        ))}
      {/* Section info */}
      {section.info && (
        <div
          style={{
            wordBreak: 'break-word',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            position: 'relative',
            minWidth: '250px',
          }}
        >
          <RichTextEditor
            value={section.info?.[languageCode]}
            missingValue={Boolean(!section.info?.[languageCode])}
            onChange={(value) => {
              onEdit({
                ...section,
                info: { ...section.info, [languageCode]: value },
              });
            }}
            editorHeight={'100px'}
          />
        </div>
      )}
    </Box>
  );
}
