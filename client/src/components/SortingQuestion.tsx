import { SurveySortingQuestion } from '@interfaces/survey';
import {
  FormControl,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Select,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useTranslations } from '@src/stores/TranslationContext';
import React, { useEffect, useState } from 'react';

interface Props {
  value: number[];
  onChange: (value: number[]) => void;
  question: SurveySortingQuestion;
  setDirty: (dirty: boolean) => void;
}

const useStyles = makeStyles({
  label: {
    marginLeft: '1rem',
  },
  select: {
    minWidth: '4rem',
  },
  fieldRow: {
    margin: '0.5rem',
    marginLeft: '1rem',
  },
});

export default function SortingQuestion(props: Props) {
  const { tr } = useTranslations();
  const [sortedOptionIds, setSortedOptionIds] = useState(
    new Array(props.question.options.length).fill(null)
  );

  const classes = useStyles();

  useEffect(() => {
    if (!sortedOptionIds || !props.onChange) {
      return;
    }
    props.onChange(sortedOptionIds);
  }, [sortedOptionIds]);

  return (
    <FormGroup>
      {props.question.options.map((option) => (
        <FormGroup row key={option.id} className={classes.fieldRow}>
          <FormControl>
            <FormControlLabel
              label={option.text}
              labelPlacement="end"
              classes={{ label: classes.label }}
              control={
                <Select
                  className={classes.select}
                  value={
                    sortedOptionIds.includes(option.id)
                      ? sortedOptionIds.indexOf(option.id)
                      : ''
                  }
                  onBlur={() => {
                    props.setDirty(true);
                  }}
                  onChange={(event) => {
                    props.setDirty(true);
                    // Remove possible previous value
                    const newSortedOptionIds = sortedOptionIds.map((optionId) =>
                      optionId === option.id ? null : optionId
                    );
                    if (event.target.value === '') {
                      // If empty was selected, leave the option ID out of the array
                      setSortedOptionIds(newSortedOptionIds);
                      return;
                    }
                    setSortedOptionIds(
                      newSortedOptionIds.map((optionId, index) =>
                        // Only replace the array item with the requested index with the current option
                        index === Number(event.target.value)
                          ? option.id
                          : optionId
                      )
                    );
                  }}
                >
                  <MenuItem value="">
                    <em>{tr.SortingQuestion.empty}</em>
                  </MenuItem>
                  {new Array(props.question.options.length)
                    .fill(null)
                    .map((_, index) => (
                      <MenuItem
                        key={index}
                        value={index}
                        disabled={sortedOptionIds[index] != null}
                      >
                        {index + 1}
                      </MenuItem>
                    ))}
                </Select>
              }
            />
          </FormControl>
        </FormGroup>
      ))}
      <ol>
        {sortedOptionIds.map((optionId, index) => (
          <li key={index}>
            {optionId == null
              ? '-'
              : props.question.options.find((option) => option.id === optionId)
                  .text}
          </li>
        ))}
      </ol>
    </FormGroup>
  );
}
