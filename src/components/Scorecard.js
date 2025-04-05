import React from 'react';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

const BattingTable = ({ battingData, title }) => {
  if (!Array.isArray(battingData)) {
    console.error('Invalid batting data:', battingData);
    return null;
  }

  return (
    <>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Batter</TableCell>
              <TableCell>Dismissal</TableCell>
              <TableCell align="right">R</TableCell>
              <TableCell align="right">B</TableCell>
              <TableCell align="right">4s</TableCell>
              <TableCell align="right">6s</TableCell>
              <TableCell align="right">SR</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {battingData.map((batter, index) => (
              <TableRow key={index}>
                <TableCell>{typeof batter.name === 'string' ? batter.name : 'Unknown'}</TableCell>
                <TableCell>{batter.dismissal || 'not out'}</TableCell>
                <TableCell align="right">{batter.runs}</TableCell>
                <TableCell align="right">{batter.balls}</TableCell>
                <TableCell align="right">{batter.fours}</TableCell>
                <TableCell align="right">{batter.sixes}</TableCell>
                <TableCell align="right">{batter.strikeRate ? batter.strikeRate.toFixed(2) : '0.00'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

const BowlingTable = ({ bowlingData, title }) => {
  if (!Array.isArray(bowlingData)) {
    console.error('Invalid bowling data:', bowlingData);
    return null;
  }

  return (
    <>
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>{title}</Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Bowler</TableCell>
              <TableCell align="right">O</TableCell>
              <TableCell align="right">M</TableCell>
              <TableCell align="right">R</TableCell>
              <TableCell align="right">W</TableCell>
              <TableCell align="right">Econ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bowlingData.map((bowler, index) => (
              <TableRow key={index}>
                <TableCell>{bowler.name}</TableCell>
                <TableCell align="right">{bowler.overs}</TableCell>
                <TableCell align="right">{bowler.maidens || 0}</TableCell>
                <TableCell align="right">{bowler.runs}</TableCell>
                <TableCell align="right">{bowler.wickets}</TableCell>
                <TableCell align="right">{bowler.economy ? bowler.economy.toFixed(2) : '0.00'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

const Scorecard = ({ matchData }) => {
  if (!matchData || !matchData.innings) return null;

  const innings = matchData.innings;

  return (
    <Paper elevation={2} sx={{ p: 3, my: 3 }}>
      <Typography variant="h5" gutterBottom>Scorecard</Typography>
      
      {innings.map((inning, index) => (
        <div key={index} style={{ marginBottom: '2rem' }}>
          <Typography variant="h6" color="primary" gutterBottom>
            {inning.team} Innings
          </Typography>
          
          <BattingTable 
            battingData={calculateBattingStats(inning)}
            title="Batting"
          />
          
          <BowlingTable 
            bowlingData={calculateBowlingStats(inning)}
            title="Bowling"
          />
        </div>
      ))}
    </Paper>
  );
};

// Helper functions
const calculateBattingStats = (inningsData) => {
  // Check if inningsData and inningsData.overs exist and is an array
  if (!inningsData || !Array.isArray(inningsData.overs)) { 
    console.error('Invalid innings data for batting (missing or invalid overs array):', inningsData);
    return [];
  }
  
  const battingStats = new Map();
  
  // Iterate through each over in the innings
  inningsData.overs.forEach(over => { 
    // Check if over and over.deliveries exist and is an array
    if (!over || !Array.isArray(over.deliveries)) {
      console.warn('Skipping invalid over data:', over);
      return; 
    }

    // Iterate through each delivery in the over
    over.deliveries.forEach(delivery => { 
      if (!delivery || typeof delivery !== 'object') return;

      const batter = delivery.batter;
    if (!batter) return;

    const runs = delivery.runs?.batter || 0;
    const isFour = runs === 4;
    const isSix = runs === 6;
    
    if (!battingStats.has(batter)) {
      battingStats.set(batter, {
        name: batter,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        dismissal: '',
        strikeRate: 0
      });
    }
    
    const stats = battingStats.get(batter);
    stats.runs += runs;
    // Only count balls faced if it's not a wide
    if (!delivery.extras?.wides) {
        stats.balls += 1;
    }
    if (isFour) stats.fours += 1;
    if (isSix) stats.sixes += 1;

    // Check for dismissal information only if the batter is not already marked as out
    if (stats.dismissal === '' && delivery.wickets && Array.isArray(delivery.wickets)) {
      const wicketInfo = delivery.wickets.find(w => w.player_out === batter); // Find the wicket for the current batter

      if (wicketInfo) {
        let dismissalText = wicketInfo.kind;
        const fielders = wicketInfo.fielders ? wicketInfo.fielders.map(f => f.name).join(' / ') : '';
        const bowler = delivery.bowler; // Bowler of the delivery where wicket fell

        switch (wicketInfo.kind) {
          case 'caught':
            // Handle caught and bowled separately if fielder is the bowler
            if (fielders === bowler) {
              dismissalText = `c & b ${bowler}`;
            } else {
              dismissalText = `c ${fielders} b ${bowler}`;
            }
            break;
          case 'bowled':
            dismissalText = `b ${bowler}`;
            break;
          case 'lbw':
            dismissalText = `lbw b ${bowler}`;
            break;
          case 'stumped':
            dismissalText = `st ${fielders} b ${bowler}`;
            break;
          case 'caught and bowled': // Explicitly handle this kind
             dismissalText = `c & b ${bowler}`;
             break;
          case 'run out':
            // Fielder info is most relevant for run out
            dismissalText = `run out (${fielders})`;
            break;
          case 'hit wicket':
            dismissalText = `hit wicket b ${bowler}`;
            break;
          // Keep 'retired hurt', etc. as is
          default:
            dismissalText = wicketInfo.kind;
        }
        stats.dismissal = dismissalText.replace(/\s+/g, ' ').trim(); // Clean up extra spaces
      }
    }

    stats.strikeRate = stats.balls > 0 ? (stats.runs / stats.balls) * 100 : 0;
    }); // End of deliveries loop
  }); // End of overs loop <-- Added missing closing brace and parenthesis
  
  const battingArray = Array.from(battingStats.values());
  console.log('Batting Stats:', battingArray);
  return battingArray;
};

const calculateBowlingStats = (inningsData) => {
  // Check if inningsData and inningsData.overs exist and is an array
  if (!inningsData || !Array.isArray(inningsData.overs)) {
    console.error('Invalid innings data for bowling (missing or invalid overs array):', inningsData);
    return [];
  }
  
  const bowlingStats = new Map();
  let totalDeliveriesByBowler = {}; // To correctly calculate overs

  // Iterate through each over in the innings
  inningsData.overs.forEach(over => {
    // Check if over and over.deliveries exist and is an array
    if (!over || !Array.isArray(over.deliveries)) {
      console.warn('Skipping invalid over data:', over);
      return;
    }

    let runsInOver = 0;
    let legalDeliveriesInOver = 0;
    let overBowler = null;

    // Iterate through each delivery in the over
    over.deliveries.forEach(delivery => {
      if (!delivery || typeof delivery !== 'object') return;

      const bowler = delivery.bowler;
    if (!bowler) return;

      if (!bowler) return;
      overBowler = bowler; // Keep track of the bowler for this over

      // Determine runs conceded by the bowler (excluding byes/legbyes)
      const concededRuns = (delivery.runs?.batter || 0) + (delivery.runs?.extras || 0) - (delivery.runs?.byes || 0) - (delivery.runs?.legbyes || 0);
      const isWicket = delivery.wickets && delivery.wickets.length > 0;
      const isLegalDelivery = !delivery.extras?.wides && !delivery.extras?.noballs;

      if (!bowlingStats.has(bowler)) {
        bowlingStats.set(bowler, {
            name: bowler,
            overs: 0, // Will calculate at the end
            maidens: 0,
            runs: 0,
            wickets: 0,
            economy: 0,
            legalDeliveries: 0 // Track legal deliveries for accurate overs/economy
          });
        totalDeliveriesByBowler[bowler] = 0;
      }
    
      const stats = bowlingStats.get(bowler);
      stats.runs += concededRuns;
      if (isWicket) {
         // Ensure wickets are counted correctly, even if multiple in one delivery (rare)
         stats.wickets += delivery.wickets.length; 
      }
      
      if (isLegalDelivery) {
        stats.legalDeliveries += 1;
        legalDeliveriesInOver += 1;
        runsInOver += concededRuns; // Only count conceded runs for maidens
        totalDeliveriesByBowler[bowler]++; // Increment total legal deliveries for this bowler
      }
    }); // End of deliveries loop

    // Check for maiden over after processing all deliveries in the over
    if (overBowler && legalDeliveriesInOver === 6 && runsInOver === 0) {
      const bowlerStats = bowlingStats.get(overBowler);
      if (bowlerStats) {
        bowlerStats.maidens += 1;
      }
    }
  }); // End of overs loop
  
  // Calculate final overs and economy
  bowlingStats.forEach(stats => {
    const legalDeliveries = stats.legalDeliveries;
    const oversCompleted = Math.floor(legalDeliveries / 6);
    const ballsInPartialOver = legalDeliveries % 6;
    stats.overs = parseFloat(`${oversCompleted}.${ballsInPartialOver}`); // Format as X.Y
    
    // Calculate economy based on legal deliveries
    const effectiveOvers = legalDeliveries / 6;
    stats.economy = effectiveOvers > 0 ? (stats.runs / effectiveOvers) : 0;

    // Clean up temporary property
    delete stats.legalDeliveries; 
  });
  
  const bowlingArray = Array.from(bowlingStats.values());
  console.log('Bowling Stats:', bowlingArray);
  return bowlingArray;
};

export default Scorecard;
