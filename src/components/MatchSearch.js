import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  InputAdornment,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const MatchSearch = ({ matches, showCount = true }) => {
  const navigate = useNavigate();
  
  const matchOptions = matches.map(match => ({
    id: match.id,
    label: `${match.teams[0]} vs ${match.teams[1]} (${match.year})`
  }));

  const handleMatchSelect = (event, value) => {
    if (value) {
      navigate(`/match/${value.id}`);
    }
  };

  return (
    <Box sx={{
      mb: showCount ? 4 : 0,
      '& .MuiInputBase-root': {
        color: 'inherit',
      },
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: 'rgba(255, 255, 255, 0.3)',
        },
        '&:hover fieldset': {
          borderColor: 'rgba(255, 255, 255, 0.5)',
        },
        '&.Mui-focused fieldset': {
          borderColor: 'rgba(255, 255, 255, 0.7)',
        },
      },
      '& .MuiInputLabel-root': {
        color: 'rgba(255, 255, 255, 0.7)',
      },
      '& .MuiAutocomplete-popupIndicator': {
        color: 'rgba(255, 255, 255, 0.7)',
      },
    }}>
      <Autocomplete
        options={matchOptions}
        getOptionLabel={(option) => option.label}
        onChange={handleMatchSelect}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search matches..."
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                </InputAdornment>
              ),
            }}
          />
        )}
        sx={{ 
          mb: showCount ? 2 : 0,
        }}
      />
      {showCount && (
        <Typography variant="body2" color="text.secondary">
          {matches.length} matches available
        </Typography>
      )}
    </Box>
  );
};

export default MatchSearch;
