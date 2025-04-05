import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useParams
} from "react-router-dom";
import { Container, CssBaseline, ThemeProvider, createTheme, Typography } from '@mui/material';
import Header from './components/Header';
import HomePage from './components/HomePage';
import MatchSelector from './components/MatchSelector';
import MatchSummary from './components/MatchSummary';
import Scorecard from './components/Scorecard';
import Visualizations from './components/Visualizations';

const theme = createTheme({
  palette: {
    primary: {
      main: '#004d99',
    },
    secondary: {
      main: '#0066cc',
    },
  },
});

function App() {
  const [matches, setMatches] = useState([]);
  const dataFolder = '/t20s_male_json/';

  useEffect(() => {
    const loadAllMatches = async () => {
      try {
        // First, fetch the list of all JSON files
        const response = await fetch('/t20s_male_json/index.json');
        if (!response.ok) throw new Error('Failed to fetch match index');
        const matchFiles = await response.json();

        const metadataPromises = matchFiles.map(async (file) => {
          try {
            const response = await fetch(`${dataFolder}/${file}`);
            if (!response.ok) return null;
            const data = await response.json();
            const info = data.info;
            const date = new Date(info.dates[0]);
            return {
              id: file.replace('.json', ''),
              teams: info.teams,
              year: date.getFullYear(),
              event: info.event || 'International Match',
              date: info.dates[0] // Add date for sorting
            };
          } catch (error) {
            console.error('Error loading match /' + file + ':', error);
            return null;
          }
        });

        const loadedMatches = await Promise.all(metadataPromises);
        setMatches(loadedMatches.filter(match => match !== null));
      } catch (error) {
        console.error('Error loading matches:', error);
        // Display an error message to the user
        alert('Error loading matches. Please check the console for details.');
      }
    };

    loadAllMatches();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage matches={matches} />} />
          <Route path="/match/:matchId" element={<MatchDetails />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

function MatchDetails() {
  const { matchId } = useParams();
  const [matchData, setMatchData] = useState(null);
  const dataFolder = '/t20s_male_json/';

  useEffect(() => {
    const loadMatchData = async () => {
      try {
        const response = await fetch(dataFolder + matchId + '.json');
        if (!response.ok) throw new Error('Match data not found');
        const data = await response.json();
        setMatchData(data);
      } catch (error) {
        console.error('Error loading match data:', error);
        setMatchData(null);
      }
    };

    loadMatchData();
  }, [matchId]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {matchData && (
        <>
          {(() => {
            try {
              return <MatchSummary matchData={matchData} />;
            } catch (error) {
              console.error("Error rendering MatchSummary:", error);
              return <Typography color="error">Error loading MatchSummary</Typography>;
            }
          })()}
          {(() => {
            try {
              return <Scorecard matchData={matchData} />;
            } catch (error) {
              console.error("Error rendering Scorecard:", error);
              return <Typography color="error">Error loading Scorecard</Typography>;
            }
          })()}
          {(() => {
            try {
              return <Visualizations matchData={matchData} />;
            } catch (error) {
              console.error("Error rendering Visualizations:", error);
              return <Typography color="error">Error loading Visualizations</Typography>;
            }
          })()}
        </>
      )}
    </Container>
  );
}

export default App;
