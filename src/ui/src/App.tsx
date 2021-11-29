import React from 'react'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import './App.scss'

import theme from './Theme'

const baseURL = process.env.REACT_APP_BASE_URL ?? 'http://localhost'

function App () {
  return (
    <div className='App'>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <img src={`${baseURL}:3456/`} alt='live-feed' />
      </ThemeProvider>
    </div>
  )
}

export default App
