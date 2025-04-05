import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';

const MatchSelector = ({ matches, selectedMatch, onMatchSelect }) => {
  return (
    <Box sx={{ my: 3 }}>
      <FormControl fullWidth>
        <InputLabel id="match-select-label">Select Match</InputLabel>
        <Select
          labelId="match-select-label"
          id="match-select"
          value={selectedMatch || ''}
          label="Select Match"
          onChange={(e) => onMatchSelect(e.target.value)}
        >
          <MenuItem value="">
            <em>Select a match</em>
          </MenuItem>
          {matches.map((match) => (
            <MenuItem key={match.id} value={match.id}>
              {`${match.teams[0]} vs ${match.teams[1]} | ${typeof match.event === 'object' ? match.event.name : match.event} ${match.year} | ID: ${match.id}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default MatchSelector;
