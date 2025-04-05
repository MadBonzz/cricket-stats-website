import React from 'react';
import { Paper, Typography, Box, Grid, Divider } from '@mui/material'; // Added Divider

// Helper to calculate total score for an innings
const calculateInningsScore = (inning) => {
  if (!inning || !Array.isArray(inning.overs)) return { runs: 0, wickets: 0 };
  
  let totalRuns = 0;
  let totalWickets = 0;

  inning.overs.forEach(over => {
    if (!over || !Array.isArray(over.deliveries)) return;
    over.deliveries.forEach(delivery => {
      if (!delivery || typeof delivery !== 'object') return;
      totalRuns += delivery.runs?.total || 0;
      if (delivery.wickets && Array.isArray(delivery.wickets)) {
        // Count wickets, excluding run outs on the non-striker's end if possible (simplification: count all wickets for now)
        totalWickets += delivery.wickets.length; 
      }
    });
  });
  
  // Cap wickets at 10
  totalWickets = Math.min(totalWickets, 10); 

  return { runs: totalRuns, wickets: totalWickets };
};


const MatchSummary = ({ matchData }) => {
  if (!matchData || !matchData.info || !matchData.innings) return null; // Check for innings data

  const { info, innings } = matchData; // Destructure innings
  const { outcome, dates, teams, event, venue } = info; // Added venue
  const date = new Date(dates[0]).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate scores for each innings
  const scores = innings.map(inning => ({
    team: inning.team,
    score: calculateInningsScore(inning)
  }));

  let resultText = '';
  if (outcome.winner) {
    if (outcome.by?.wickets) {
      resultText = `${outcome.winner} won by ${outcome.by.wickets} wickets`;
    } else if (outcome.by?.runs) {
      resultText = `${outcome.winner} won by ${outcome.by.runs} runs`;
    } else {
      resultText = `${outcome.winner} won`;
    }
  } else if (outcome.result) {
    resultText = outcome.result;
  }

  return (
    <Paper elevation={2} sx={{ p: 3, my: 3 }}>
      <Typography variant="h5" gutterBottom>Match Summary</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ mb: 1 }}>
            <Typography component="span" fontWeight="bold">Date: </Typography>
            <Typography component="span">{date}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ mb: 1 }}>
            <Typography component="span" fontWeight="bold">Teams: </Typography>
            <Typography component="span">{teams.join(' vs ')}</Typography>
          </Box>
        </Grid>
        {/* Display Scores */}
        {scores.map((s, index) => (
          <Grid item xs={12} sm={6} key={index}>
             <Box sx={{ mb: 1 }}>
               <Typography component="span" fontWeight="bold">{s.team}: </Typography>
               <Typography component="span">{s.score.runs}/{s.score.wickets}</Typography>
             </Box>
          </Grid>
        ))}
        <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid> {/* Add a divider */}
        {event && (
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 1 }}>
              <Typography component="span" fontWeight="bold">Event: </Typography>
              <Typography component="span">
                {typeof event === 'object' && event !== null && typeof event.name === 'string' ? event.name : event}
              </Typography>
            </Box>
          </Grid>
        )}
        {venue && ( // Display Venue
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 1 }}>
              <Typography component="span" fontWeight="bold">Venue: </Typography>
              <Typography component="span">{venue}</Typography>
          </Box>
        </Grid>
        )}
        <Grid item xs={12}>
          <Box sx={{ mb: 1 }}>
            <Typography component="span" fontWeight="bold">Result: </Typography>
            <Typography component="span">{resultText}</Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default MatchSummary;
