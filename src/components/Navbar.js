import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Link,
  Box,
  Container,
  alpha
} from '@mui/material';
import MatchSearch from './MatchSearch';

const Navbar = ({ matches }) => {
  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 3,
          py: 1
        }}>
          <Link
            component={RouterLink}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              '&:hover': {
                textDecoration: 'none',
              },
            }}
          >
            <Typography variant="h6" component="div" sx={{ whiteSpace: 'nowrap' }}>
              Cricket Match Centre
            </Typography>
          </Link>
          
          <Box sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            justifyContent: 'flex-end',
            maxWidth: '500px',
            ml: 'auto'
          }}>
            <Box sx={{ 
              width: '100%',
              backgroundColor: alpha('#fff', 0.15),
              borderRadius: 1,
              '&:hover': {
                backgroundColor: alpha('#fff', 0.25),
              },
            }}>
              <MatchSearch 
                matches={matches} 
                showCount={false}
              />
            </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
