import React from 'react'
import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material'

import Navbar from './Navbar'

const useStyles = makeStyles((theme: Theme) => {
  return {
    container: {
      width: '100%',
      minHeight: '100vh',
    },
    contentContainer: {
      display: 'flex',
      maxWidth: '1980px',
      margin: '0 auto',
      flexDirection: 'column',
      minHeight: 'calc(100vh - 40px)',
      [theme.breakpoints.up('md')]: {
        flexDirection: 'row',
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