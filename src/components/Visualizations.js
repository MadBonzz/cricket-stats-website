import React from 'react';
import { Paper, Typography, Grid, Box } from '@mui/material';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Visualizations = ({ matchData }) => {
  if (!matchData || !matchData.innings) return null;

  // Calculate data for all charts
  const manhattanData = calculateManhattanData(matchData);
  const battingContributionsData = calculateBattingContributions(matchData); // Returns array per innings
  const topPerformersData = calculateTopPerformers(matchData); // Stays combined for now
  const bowlingAnalysisData = calculateBowlingAnalysis(matchData); // Returns array per innings
  const wormGraphData = calculateWormGraphData(matchData); // Calculate Worm Graph data

  // Define a common style for chart containers to make them slightly larger
  const chartContainerStyle = { p: 2, minHeight: '350px', display: 'flex', flexDirection: 'column' };
  const chartWrapperStyle = { flexGrow: 1, position: 'relative' }; // Needed for chart.js responsiveness

  return (
    <Paper elevation={2} sx={{ p: 3, my: 3 }}>
      <Typography variant="h5" gutterBottom>Match Analysis</Typography>
      <Grid container spacing={4}> {/* Increased spacing */}
        {/* Manhattan Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={chartContainerStyle}>
            <Typography variant="h6" gutterBottom>Runs per Over</Typography>
            <Box sx={chartWrapperStyle}>
              <Line data={manhattanData} options={manhattanOptions} />
            </Box>
          </Paper>
        </Grid>
         {/* Worm Graph */}
         <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={chartContainerStyle}>
            <Typography variant="h6" gutterBottom>Cumulative Score (Worm Graph)</Typography>
            <Box sx={chartWrapperStyle}>
              <Line data={wormGraphData} options={wormGraphOptions} /> 
            </Box>
          </Paper>
        </Grid>
        {/* Top Performers (Batting Strike Rate) */}
        <Grid item xs={12} md={6}>
           <Paper elevation={1} sx={chartContainerStyle}>
            <Typography variant="h6" gutterBottom>Top Batting Performers (SR)</Typography>
             <Box sx={chartWrapperStyle}>
              <Bar data={topPerformersData} options={barOptions} />
             </Box>
          </Paper>
        </Grid>
        {/* Batting Contributions - One chart per innings */}
        {battingContributionsData.map((data, index) => (
          <Grid item xs={12} md={6} key={`batting-${index}`}>
            <Paper elevation={1} sx={chartContainerStyle}>
              <Typography variant="h6" gutterBottom>{`${matchData.innings[index].team} Batting Contributions`}</Typography>
              <Box sx={chartWrapperStyle}>
                <Pie data={data} options={pieOptions} />
              </Box>
            </Paper>
          </Grid>
        ))}
        {/* Bowling Analysis - One chart per innings */}
        {bowlingAnalysisData.map((data, index) => (
          <Grid item xs={12} md={6} key={`bowling-${index}`}>
            <Paper elevation={1} sx={chartContainerStyle}>
              <Typography variant="h6" gutterBottom>{`${matchData.innings[index].team} Bowling Analysis (Econ)`}</Typography>
              <Box sx={chartWrapperStyle}>
                <Bar data={data} options={barOptions} />
              </Box>
            </Paper> {/* Corrected closing tag */}
          </Grid>
        ))} {/* End bowling analysis loop */}
      </Grid>
    </Paper>
  );
};

// Chart options
const manhattanOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: false
    }
  },
  scales: {
    y: { beginAtZero: true, title: { display: true, text: 'Runs' } },
    x: { title: { display: true, text: 'Over' } }
  },
  maintainAspectRatio: false // Allow chart to fill container height
};

const pieOptions = {
  responsive: true,
  plugins: { legend: { position: 'right' } },
  maintainAspectRatio: false // Allow chart to fill container height
};

const barOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    }
  },
  scales: { y: { beginAtZero: true } },
  maintainAspectRatio: false // Allow chart to fill container height
};

// Options specific to Worm Graph (similar to Manhattan but cumulative)
const wormGraphOptions = {
  responsive: true,
  plugins: { legend: { position: 'top' }, title: { display: false } },
  scales: {
    y: { beginAtZero: true, title: { display: true, text: 'Cumulative Runs' } },
    x: { title: { display: true, text: 'Over' } }
  },
  maintainAspectRatio: false
};


// Data calculation functions
const calculateManhattanData = (matchData) => {
  if (!matchData?.innings || !Array.isArray(matchData.innings)) {
    console.error('Invalid match data for manhattan chart:', matchData);
    return { labels: [], datasets: [] };
  }

  const runsPerOverByInnings = matchData.innings.map(inning => {
    // Check if inning and inning.overs exist and is an array
    if (!inning || !Array.isArray(inning.overs)) {
      console.warn('Skipping invalid inning data for Manhattan chart:', inning);
      return [];
    }
    
    const oversData = {};
    // Iterate through each over
    inning.overs.forEach(over => {
      // Check if over and over.deliveries exist and is an array
      if (!over || !Array.isArray(over.deliveries)) return;
      
      const overNum = over.over; // Use over.over for the over number
      if (typeof overNum !== 'number') return;

      if (!oversData[overNum]) oversData[overNum] = 0;
      
      // Sum runs from each delivery in the over
      over.deliveries.forEach(delivery => {
        if (delivery && delivery.runs) {
          oversData[overNum] += delivery.runs.total || 0;
        }
      });
    });
    // Return runs for each over, ordered by over number
    return Object.keys(oversData).sort((a, b) => a - b).map(overNum => oversData[overNum]);
  }).filter(arr => arr.length > 0); // Filter out empty innings data

  if (runsPerOverByInnings.length === 0) {
    return { labels: [], datasets: [] };
  }

  // Determine the maximum number of overs bowled in any innings for the labels
  const maxOvers = Math.max(...runsPerOverByInnings.map(arr => arr.length));

  return {
    labels: Array.from({ length: maxOvers }, (_, i) => i + 1), // Labels from 1 to maxOvers
    datasets: matchData.innings
      .filter((_, i) => runsPerOverByInnings[i] && runsPerOverByInnings[i].length > 0) // Ensure we have data for this innings
      .map((inning, i) => ({
        label: `${inning.team} Innings`,
        data: runsPerOverByInnings[i],
        fill: false,
        borderColor: i === 0 ? 'rgb(75, 192, 192)' : 'rgb(255, 99, 132)',
        tension: 0.1
      }))
  };
};

// Returns an array of chart data objects, one for each innings
const calculateBattingContributions = (matchData) => {
  if (!matchData?.innings || !Array.isArray(matchData.innings)) {
    console.error('Invalid match data for batting contributions:', matchData);
    return []; // Return empty array if data is invalid
  }

  // Process each innings separately
  return matchData.innings.map(inning => {
    if (!inning || !Array.isArray(inning.overs)) {
      return { labels: [], datasets: [{ data: [], backgroundColor: [] }] }; // Return empty structure for invalid inning
    }

    const battingTotals = new Map();
    inning.overs.forEach(over => {
      if (!over || !Array.isArray(over.deliveries)) return;
      over.deliveries.forEach(delivery => {
        if (!delivery || typeof delivery !== 'object') return;
        const batter = delivery.batter;
        const runs = delivery.runs?.batter || 0;
        if (!batter) return;
        battingTotals.set(batter, (battingTotals.get(batter) || 0) + runs);
      });
    });

    const battingStats = Array.from(battingTotals.entries())
      .filter(([_, runs]) => runs > 0)
      .map(([name, runs]) => ({ name, runs }));

    // Sort by runs and take top contributors (e.g., top 5)
    const topBatters = battingStats
      .sort((a, b) => b.runs - a.runs)
      .slice(0, 5); // Show top 5 contributors

    // Aggregate remaining runs into 'Others'
    const topRuns = topBatters.reduce((sum, b) => sum + b.runs, 0);
    const totalRuns = battingStats.reduce((sum, b) => sum + b.runs, 0);
    const otherRuns = totalRuns - topRuns;

    const labels = topBatters.map(b => typeof b.name === 'string' ? b.name : 'Unknown');
    const data = topBatters.map(b => b.runs);

    if (otherRuns > 0) {
      labels.push('Others');
      data.push(otherRuns);
    }

    const colors = [
      'rgba(255, 99, 132, 0.8)',
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 206, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)',
      'rgba(153, 102, 255, 0.8)',
      'rgba(255, 159, 64, 0.8)' // Color for 'Others'
    ];

    return {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors.slice(0, data.length)
      }]
    };
  }); // End map over innings
};

const calculateTopPerformers = (matchData) => {
  if (!matchData?.innings || !Array.isArray(matchData.innings)) {
    console.error('Invalid match data for top performers:', matchData);
    return { labels: [], datasets: [{ label: 'Strike Rate', data: [], backgroundColor: 'rgba(75, 192, 192, 0.8)' }] };
  }

  const battingDetails = new Map();

  matchData.innings.forEach(inning => {
    if (!inning || !Array.isArray(inning.overs)) return;

    inning.overs.forEach(over => {
      if (!over || !Array.isArray(over.deliveries)) return;

      over.deliveries.forEach(delivery => {
        if (!delivery || typeof delivery !== 'object') return;
        const batter = delivery.batter;
        if (!batter) return;
        const runs = delivery.runs?.batter || 0;
        const isLegalBall = !delivery.extras?.wides; // Balls faced excludes wides

        if (!battingDetails.has(batter)) {
          battingDetails.set(batter, { runs: 0, balls: 0 });
        }
        const playerStats = battingDetails.get(batter);
        playerStats.runs += runs;
        if (isLegalBall) {
          playerStats.balls += 1;
        }
      });
    });
  });

  const battingStats = Array.from(battingDetails.entries())
    .filter(([_, { balls }]) => balls >= 10) // Only include batters who faced at least 10 balls
    .map(([name, { runs, balls }]) => ({
      name,
      runs,
      strikeRate: balls > 0 ? (runs / balls) * 100 : 0
    }));

  const topBatters = battingStats
    .sort((a, b) => b.strikeRate - a.strikeRate)
    .slice(0, 5);

  return {
    labels: topBatters.map(b => b.name),
    datasets: [{
      label: 'Strike Rate',
      data: topBatters.map(b => b.strikeRate),
      backgroundColor: 'rgba(75, 192, 192, 0.8)'
    }]
  };
};

// Returns an array of chart data objects, one for each innings
const calculateBowlingAnalysis = (matchData) => {
  if (!matchData?.innings || !Array.isArray(matchData.innings)) {
    console.error('Invalid match data for bowling analysis:', matchData);
    return []; // Return empty array
  }

  // Process each innings separately
  return matchData.innings.map(inning => {
    if (!inning || !Array.isArray(inning.overs)) {
       return { labels: [], datasets: [{ label: 'Economy Rate', data: [], backgroundColor: 'rgba(255, 99, 132, 0.8)' }] };
    }

    const bowlingDetails = new Map();
    inning.overs.forEach(over => {
      if (!over || !Array.isArray(over.deliveries)) return;
      over.deliveries.forEach(delivery => {
        if (!delivery || typeof delivery !== 'object') return;
        const bowler = delivery.bowler;
        if (!bowler) return;

        const concededRuns = (delivery.runs?.batter || 0) + (delivery.runs?.extras || 0) - (delivery.runs?.byes || 0) - (delivery.runs?.legbyes || 0);
        const isLegalDelivery = !delivery.extras?.wides && !delivery.extras?.noballs;
        const wickets = delivery.wickets ? delivery.wickets.length : 0;

        if (!bowlingDetails.has(bowler)) {
          bowlingDetails.set(bowler, { runs: 0, wickets: 0, legalDeliveries: 0 });
        }
        const bowlerStats = bowlingDetails.get(bowler);
        bowlerStats.runs += concededRuns;
        bowlerStats.wickets += wickets;
        if (isLegalDelivery) {
          bowlerStats.legalDeliveries += 1;
        }
      });
    });

    const bowlingStats = Array.from(bowlingDetails.entries())
      .filter(([_, { legalDeliveries }]) => legalDeliveries > 0) // Include all bowlers who bowled at least one legal ball
      .map(([name, { runs, wickets, legalDeliveries }]) => ({
        name,
        economy: legalDeliveries > 0 ? (runs / (legalDeliveries / 6)) : 0,
        wickets
      }));

    // Sort by economy rate (lower is better)
    const sortedBowlers = bowlingStats.sort((a, b) => a.economy - b.economy);

    return {
      labels: sortedBowlers.map(b => b.name),
      datasets: [{
        label: 'Economy Rate',
        data: sortedBowlers.map(b => b.economy),
        backgroundColor: 'rgba(255, 99, 132, 0.8)'
      }]
    };
  }); // End map over innings
};

// Calculate data for Worm Graph (Cumulative Score per Over)
const calculateWormGraphData = (matchData) => {
  if (!matchData?.innings || !Array.isArray(matchData.innings)) {
    console.error('Invalid match data for worm graph:', matchData);
    return { labels: [], datasets: [] };
  }

  let maxOvers = 0;
  const cumulativeScores = matchData.innings.map(inning => {
    if (!inning || !Array.isArray(inning.overs)) return [];

    const scores = [];
    let currentScore = 0;
    let lastOverNum = -1;

    inning.overs.forEach(over => {
      if (!over || !Array.isArray(over.deliveries)) return;
      const overNum = over.over;
      if (typeof overNum !== 'number') return;

      // Fill gaps if overs are missing (though unlikely with this data format)
      for (let i = lastOverNum + 1; i < overNum; i++) {
        scores.push(currentScore);
      }

      over.deliveries.forEach(delivery => {
        if (delivery && delivery.runs) {
          currentScore += delivery.runs.total || 0;
        }
      });
      scores.push(currentScore); // Score at the end of this over
      lastOverNum = overNum;
    });
    maxOvers = Math.max(maxOvers, scores.length);
    return scores;
  }).filter(arr => arr.length > 0);

  if (cumulativeScores.length === 0) {
    return { labels: [], datasets: [] };
  }

  return {
    labels: Array.from({ length: maxOvers }, (_, i) => i + 1), // Overs 1 to maxOvers
    datasets: matchData.innings
      .filter((_, i) => cumulativeScores[i] && cumulativeScores[i].length > 0)
      .map((inning, i) => ({
        label: `${inning.team} Cumulative`,
        data: cumulativeScores[i],
        fill: false,
        borderColor: i === 0 ? 'rgb(75, 192, 192)' : 'rgb(255, 99, 132)',
        tension: 0.1
      }))
  };
};


export default Visualizations;
