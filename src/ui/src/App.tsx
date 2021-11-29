import React from 'react';
import logo from './logo.svg';
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import './App.scss';

import theme from './Theme'

function App() {
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <CssBaseline />
        Hello
      </ThemeProvider>
    </div>
  );
}

export default App;
