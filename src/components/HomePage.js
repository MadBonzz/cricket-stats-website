import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Paper,

  Container,
  Pagination,
  Stack
} from '@mui/material';


const MATCHES_PER_PAGE = 12; // Show 3x4 grid

const HomePage = ({ matches }) => {
  const [page, setPage] = useState(1);

  // Sort matches by date (newest first)
  const sortedMatches = useMemo(() => 
    [...matches].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [matches]
  );

  // Calculate pagination
  const pageCount = Math.ceil(matches.length / MATCHES_PER_PAGE);
  const currentMatches = sortedMatches.slice(
    (page - 1) * MATCHES_PER_PAGE,
    page * MATCHES_PER_PAGE
  );

  return (
    <Container maxWidth="lg">
      <Paper elevation={2} sx={{ p: 3, my: 3 }}>
        <Typography variant="h5" gutterBottom>Recent Matches</Typography>
        {matches.length === 0 ? (
          <Typography variant="body1">No matches found.</Typography>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              {currentMatches.map((match) => (
                <Grid item xs={12} md={4} key={match.id} sx={{ display: 'flex' }}>
                  <Card sx={{ 
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <CardContent>
                      <Typography variant="h6" component="div" gutterBottom>
                        {match.teams[0]} vs {match.teams[1]}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {typeof match.event === 'object' ? match.event.name : match.event} ({match.year})
                      </Typography>
                      <Link 
                        to={`/match/${match.id}`} 
                        style={{ 
                          textDecoration: 'none',
                          color: 'primary.main'
                        }}
                      >
                        View Match Details
                      </Link>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Stack spacing={2} alignItems="center">
              <Pagination 
                count={pageCount} 
                page={page} 
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Stack>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default HomePage;
