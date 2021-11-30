import React from 'react'
// import useWebSocket, { ReadyState } from 'react-use-websocket'
import io from 'socket.io-client'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import './App.scss'

import theme from './Theme'

// const baseURL = process.env.REACT_APP_BASE_URL ?? ''

function App () {
  // Public API that will echo messages sent to it back to the client
  const socketUrl = 'ws://localhost:5000'
  React.useEffect(() => {
    const socket = io(socketUrl, {
      transports: ['websocket']
    })

    console.log('Connecting socket')

    socket.on('connected', () => {
      console.log('Connected socket')
    })

    socket.on('frame', (data) => {
      const m = new Date()
      const dateString = m.getUTCHours() + ':' + m.getUTCMinutes() + ':' + m.getUTCSeconds()
      console.log('sent message at', data.pom.time, ', but received at', dateString)
    })
  })

  return (
    <div className='App'>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {/* <img src={`${baseURL}/output/live`} alt='live-feed' /> */}
      </ThemeProvider>
    </div>
  )
}

export default App
