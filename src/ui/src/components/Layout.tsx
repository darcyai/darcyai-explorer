import React from 'react'
import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material'

import Navbar from './Navbar'

const useStyles = makeStyles((theme: Theme) => {
  return {
    container: {
      width: '100%',
      minHeight: '100vh'
    },
    contentContainer: {
      display: 'grid',
      maxWidth: '1980px',
      margin: '0 auto',
      flexDirection: 'column',
      minHeight: 'calc(100vh - 56px)',
      [theme.breakpoints.up('md')]: {
        gridAutoFlow: 'column',
        gridAutoColumns: 'minmax(0, 1fr)'
        // gridTemplateRows: '500px'
      }
    }
  }
})

const Layout: React.FC = ({ children }) => {
  const classes = useStyles()
  return (
    <div className={classes.container}>
      <Navbar />
      <div className={classes.contentContainer}>
        {children}
      </div>
    </div>
  )
}

export default Layout
