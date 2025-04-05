import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

const Header = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h4" component="h1">
          Cricket Match Centre
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
