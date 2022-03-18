import React from 'react'

import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material'
import { usePipeline } from '../providers/Pipeline'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center'
  },
  container: {
    maxWidth: 990,
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    backgroundColor: theme.palette.neutral[5]
  },
  item: {
    flex: 1,
    gap: theme.spacing(1),
    flexDirection: 'column',
    backgroundColor: theme.palette.primary.main,
    minHeight: theme.spacing(11),
    padding: theme.spacing(1),
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(2),
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      flexDirection: 'row'
    }
  },
  number: {
    font: 'normal normal normal 1.5rem/1.5rem Gilroy',
    letterSpacing: 0,
    color: theme.palette.neutral[3],
    [theme.breakpoints.up('md')]: {
      fontSize: '2.25rem',
      lineHeight: '2.25rem'
    }
  },
  label: {
    font: 'normal normal 500 0.68rem/0.68rem Gilroy',
    letterSpacing: 0.26,
    color: theme.palette.neutral[3],
    textTransform: 'uppercase',
    [theme.breakpoints.up('md')]: {
      fontSize: '0.8125rem',
      lineHeight: '0.8125rem'
    }
  }
}))

const Summary: React.FC = () => {
  const classes = useStyles()
  const timeoutRef = React.useRef<number | null>(null)
  const { isPlaying, summary, fetchSummary } = usePipeline()
  // Using a ref to avoid memoization of the isPlaying value.
  const isPlayingRef = React.useRef<boolean>(isPlaying)

  async function pollSummary (): Promise<void> {
    if (!isPlayingRef.current) { return } // Using a ref to avoid memoization of the isPlaying value.
    try {
      await fetchSummary()
    } catch (e) {

    }
    timeoutRef.current = window.setTimeout(() => { void pollSummary() }, 1.5 * 1000)
  }

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current != null) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  React.useEffect(() => {
    isPlayingRef.current = isPlaying
    if (isPlaying) {
      void pollSummary()
    } else {
      if (timeoutRef.current != null) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [isPlaying])

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <div className={classes.item}>
          <span className={classes.number}>{summary.inScene}</span>
          <span className={classes.label}>People in scene</span>
        </div>
        <div className={classes.item}>
          <span className={classes.number}>{summary.visitors}</span>
          <span className={classes.label}>Visitors</span>
        </div>
        <div className={classes.item}>
          <span className={classes.number}>{summary.faceMasks}</span>
          <span className={classes.label}>Face mask detected</span>
        </div>
        <div className={classes.item}>
          <span className={classes.number}>{summary.qrCodes}</span>
          <span className={classes.label}>QR Codes detected</span>
        </div>
      </div>
    </div>
  )
}

export default Summary
