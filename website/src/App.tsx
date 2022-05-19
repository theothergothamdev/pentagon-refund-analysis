import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';

import Alert from '@mui/material/Alert';

import data from './data.json';
import { useState } from 'react';

function App() {
  const [textFilter, setTextFilter] = useState('');

  const filteredData = textFilter
    ? data.refunded.filter(item => item.walletAddress.indexOf(textFilter) > -1)
    : [...data.refunded];

  return (
    <Container sx={{ p: 5 }}>
      <Alert severity="info">
        <div>Total wallets: {data.totalWallets}</div>
        <div>Total wallets refunded: {data.totalWalletsRefunded}</div>
        <div>Total wallets not refunded: {data.totalWalletsNotRefunded}</div>
      </Alert>
      <Paper component="form" sx={{ p: '2px 4px', my: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
          <SearchIcon />
        </IconButton>
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Filter Results"
          inputProps={{ 'aria-label': 'filter results' }}
          value={textFilter}
          onChange={event => {
            setTextFilter(event.target.value);
          }}
        />
      </Paper>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Wallet Address</TableCell>
              <TableCell align="right">Refund Total (MATIC)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((row, index) => (
              <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row">
                  <a href={`https://polygonscan.com/address/${row.walletAddress}`}>{row.walletAddress}</a>
                </TableCell>
                <TableCell align="right">{row.refundTotal}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default App;
