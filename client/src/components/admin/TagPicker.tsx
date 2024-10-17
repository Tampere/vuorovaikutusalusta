import { Autocomplete, TextField } from '@mui/material';
import { getOrgTags } from '@src/controllers/SurveyController';
import React, { useEffect, useState } from 'react';
interface Props {
  selectedTags: string[];
  freeSolo: boolean;
  onSelectedTagsChange: (tags: string[]) => void;
}

export function TagPicker({
  selectedTags,
  freeSolo,
  onSelectedTagsChange,
}: Props) {
  const [selected, setSelected] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    setSelected(selectedTags);
  }, [selectedTags]);

  useEffect(() => {
    async function updateOrgTags() {
      try {
        setTags(await getOrgTags());
      } catch (error) {
        // retry after a failure
        setTimeout(updateOrgTags, 2000);
      }
    }
    updateOrgTags();
  }, []);

  const handleTagChange = (_event: any, newValue: string[]) => {
    setSelected(newValue);
    onSelectedTagsChange(newValue); // Notify the parent component of the new selected tags
  };

  return (
    <Autocomplete
      multiple
      id="tags-outlined"
      freeSolo={freeSolo}
      value={selected}
      options={tags}
      getOptionLabel={(option) => option}
      onChange={handleTagChange}
      defaultValue={[]}
      filterSelectedOptions
      sx={{ width: 500 }}
      renderInput={(params) => <TextField {...params} label="filterTags" />}
    />
  );
}
