import React from 'react'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import './App.scss'

import theme from './Theme'

const baseURL = process.env.REACT_APP_BASE_URL ?? ''

function App () {
  return (
    <div className='App'>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <img src={`${baseURL}/output/live`} alt='live-feed' />
      </ThemeProvider>
    </div>
  )
}

export default App
