import React from 'react'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import './App.scss'

import theme from './Theme'
import Layout from './components/Layout'
import Details from './components/Details'
import Landing from './components/Landing'
import { PipelineProvider } from './providers/Pipeline'
import { FeedbackProvider } from './providers/Feedback'

function App () {
  // Public API that will echo messages sent to it back to the client
  const [showDetails, setShowDetails] = React.useState < boolean > (false)

  return (
    <div className='App'>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <FeedbackProvider>
          <PipelineProvider setShowDetails={setShowDetails}>
            <Layout>
              <Landing inspect={() => setShowDetails(true)} showInspect={!showDetails} />
              {showDetails && <Details close={() => setShowDetails(false)} />}
            </Layout>
          </PipelineProvider>
        </FeedbackProvider>
      </ThemeProvider>
    </div>
  )
}

export default App
