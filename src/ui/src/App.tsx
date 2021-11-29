import React from 'react'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import './App.scss'

import theme from './Theme'

function App () {
  return (
    <div className='App'>
      <ThemeProvider theme={theme}>
        <CssBaseline />
      </ThemeProvider>
    </div>
  )
}

export default App
