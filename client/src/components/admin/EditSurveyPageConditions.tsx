import {
  Box,
  Checkbox,
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { useSurvey } from '@src/stores/SurveyContext';
import React from 'react';
import { useParams } from 'react-router-dom';
import { ConditionRow } from './ConditionRow';
import { useTranslations } from '@src/stores/TranslationContext';
import {
  Conditions,
  SurveyPage,
  SurveyPageConditions,
} from '@interfaces/survey';
import { isFollowUpSectionParentType } from '@src/utils/typeCheck';

interface SurveyPageConditionProps {
  pages: SurveyPage[];
  activePage: SurveyPage;
  sectionId: string;
  sectionLabel: string;
}

function SurveyPageCondition({
  pages,
  activePage,
  sectionId,
  sectionLabel,
}: SurveyPageConditionProps) {
  const { tr } = useTranslations();
  const { editPage } = useSurvey();

  const selectedQuestion = pages
    .find((page) =>
      page.sections.some((section) => section.id === Number(sectionId)),
    )
    ?.sections.find((sect) => sect.id === Number(sectionId));

  function getOptionsWithSectionId(sectionId: string) {
    if (
      !sectionId ||
      sectionId === '' ||
      (selectedQuestion.type !== 'radio' &&
        selectedQuestion.type !== 'checkbox')
    )
      return [];

    return selectedQuestion.options;
  }

  function handleConditionUpdate(operator: keyof Conditions, value: number[]) {
    editPage({
      ...activePage,
      conditions: {
        ...activePage.conditions,
        [sectionId]: {
          ...(activePage.conditions?.[Number(sectionId)] ?? {}),
          [operator]: value,
        },
      } as SurveyPageConditions,
    });
  }

  return (
    <FormControl sx={{ margin: '1.5rem 0 ' }} fullWidth>
      <FormLabel>{sectionLabel}</FormLabel>

      <ConditionRow
        alignment="left"
        conditionIsNumeric={['numeric', 'slider'].includes(
          selectedQuestion?.type,
        )}
        allowCustomAnswer={
          (selectedQuestion.type === 'checkbox' ||
            selectedQuestion.type === 'radio') &&
          selectedQuestion.allowCustomAnswer
        }
        conditions={activePage.conditions[Number(sectionId)]}
        options={getOptionsWithSectionId(sectionId)}
        label={tr.EditSurveyPage.conditions.equals}
        onInput={(value) => handleConditionUpdate('equals', value)}
        textFieldValue={
          activePage.conditions[selectedQuestion.id]?.equals[0] ?? ''
        }
      />
      {['numeric', 'slider'].includes(selectedQuestion?.type) && (
        <>
          <ConditionRow
            alignment="left"
            conditionIsNumeric
            label={tr.FollowUpSection.conditions.types.greaterThan}
            onInput={(value) => handleConditionUpdate('greaterThan', value)}
            textFieldValue={
              activePage.conditions[selectedQuestion.id]?.greaterThan[0] ?? ''
            }
          />

          <ConditionRow
            alignment="left"
            conditionIsNumeric
            label={tr.FollowUpSection.conditions.types.lessThan}
            onInput={(value) => handleConditionUpdate('lessThan', value)}
            textFieldValue={
              activePage.conditions[selectedQuestion.id]?.lessThan[0] ?? ''
            }
          />
        </>
      )}
    </FormControl>
  );
}

export function EditSurveyPageConditions() {
  const { activeSurvey } = useSurvey();
  const { surveyLanguage } = useTranslations();
  const { editPage } = useSurvey();
  const { tr } = useTranslations();

  const { pageId } = useParams<{
    pageId: string;
  }>();

  const emptyConditions: Conditions = {
    equals: [],
    lessThan: [],
    greaterThan: [],
  };

  const activePageIndex = activeSurvey.pages.findIndex(
    (page) => page.id === Number(pageId),
  );

  if (activePageIndex === 0) return null;

  const activePage = activeSurvey.pages[activePageIndex];
  const previousPages = activeSurvey.pages.slice(0, activePageIndex);
  const conditionList = Object.entries(activePage.conditions);

  const previousQuestions = previousPages
    .map((page, pageIndex) =>
      page.sections
        .filter((sect) => isFollowUpSectionParentType(sect))
        .map((section) => ({
          id: section.id,
          title: section.title,
          pageId: page.id,
          pageIndex,
        })),
    )
    .flat(1);

  function handleQuestionSelect(event: SelectChangeEvent<string[]>) {
    let { value } = event.target;
    // On autofill we get a stringified value.
    if (typeof value === 'string') {
      value = value.split(',').map((v) => v);
    }
    const currentPageConditionIds = Object.keys(activePage.conditions);
    const updatedConditions = value.reduce((newConditions, id) => {
      if (currentPageConditionIds.includes(id)) {
        return {
          ...newConditions,
          [id]: activePage.conditions[Number(id)],
        };
      }
      return {
        ...newConditions,
        [id]: emptyConditions,
      };
    }, {} as SurveyPageConditions);

    editPage({
      ...activePage,
      conditions: updatedConditions,
    });
  }

  return (
    <Box
      sx={{ dipslay: 'flex', flexDirection: 'column', marginBottom: '10px' }}
    >
      <FormControl
        fullWidth
        sx={{
          flexDirection: 'row',
          marginTop: '10px',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <FormLabel
          sx={{
            flex: 1,
            color: '#000',
            textAlign: 'left',
          }}
        >
          {tr.EditSurveyPage.conditions.label}
        </FormLabel>
        <Select
          multiple
          displayEmpty
          sx={{
            flex: 2,
            backgroundColor: 'white',
            '& .MuiSelect-select': { paddingY: '0.75rem' },
          }}
          renderValue={(_selected) =>
            'Valitse kysymykset, joille ehto asetetaan'
          }
          value={Object.keys(activePage.conditions)}
          onChange={(event) => handleQuestionSelect(event)}
        >
          {previousQuestions.map((question) => (
            <MenuItem
              key={`${question.pageId}-${question.id}`}
              value={String(question.id)}
            >
              <Checkbox
                checked={
                  Object.keys(activePage.conditions).indexOf(
                    String(question.id),
                  ) > -1
                }
              />
              <Typography>{`Sivu ${question.pageIndex + 1}: ${
                question.title[surveyLanguage]
              }`}</Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {conditionList?.length > 0 ? (
        conditionList.map(([sectionId, _conditions]) => {
          const question = previousQuestions.find(
            (q) => q.id === Number(sectionId),
          );
          return (
            <SurveyPageCondition
              sectionLabel={`Sivu ${question?.pageIndex + 1}: ${question?.title[
                surveyLanguage
              ]}`}
              key={sectionId}
              pages={previousPages}
              activePage={activePage}
              sectionId={sectionId}
            />
          );
        })
      ) : (
        <Typography sx={{ marginTop: '2rem' }}>
          {tr.EditSurveyPage.conditions.noConditionsSet}
        </Typography>
      )}
    </Box>
  );
}
