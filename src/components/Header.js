import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Link } from '@mui/material';

const Header = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Link
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            '&:hover': {
              textDecoration: 'none',
            },
          }}
        >
          <Typography variant="h6" component="div">
            Cricket Match Centre
          </Typography>
        </Link>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
