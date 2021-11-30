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
  const [lastMessages, setLastMessages] = React.useState<string[]>([])
  React.useEffect(() => {
    const socket = io(socketUrl, {
      transports: ['websocket']
    })

    console.log('Connecting socket...')

    socket.on('connected', () => {
      console.log('Connected socket')
    })

    socket.on('frame', (data) => {
      const m = new Date()
      const dateString = m.getUTCHours() + ':' + m.getUTCMinutes() + ':' + m.getUTCSeconds()
      const newMessage = 'sent message at' + data.pom.time + ', but received at' + dateString
      console.log(newMessage)
      setLastMessages(currentMessages => currentMessages.concat(newMessage).slice(-15))
    })

    return () => { socket.close() }
  }, [])

  return (
    <div className='App'>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{ backgroundColor: 'black', color: 'white', minWidth: '1200px', minHeight: 800, margin: 'auto' }}>
          {lastMessages.map((m, idx) => <div key={idx}>{m}<br/></div>)}
        </div>
        {/* <img src={`${baseURL}/output/live`} alt='live-feed' /> */}
      </ThemeProvider>
    </div>
  )
}

export default App
