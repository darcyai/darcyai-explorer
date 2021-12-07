import React from 'react'

import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material'
import { useFeedback } from '../providers/Feedback'
import { usePipeline } from '../providers/Pipeline'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  container: {
    maxWidth: 990,
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    backgroundColor: theme.palette.neutral[5],
  },
  item: {
    flex: 1,
    gap: theme.spacing(1),
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    backgroundColor: theme.palette.primary.main,
    minHeight: theme.spacing(11),
    padding: theme.spacing(2),
    display: 'flex',
  },
  number: {
    font: 'normal normal normal 36px/36px Gilroy',
    letterSpacing: 0,
    color: theme.palette.neutral[3]
  },
  label: {
    font: 'normal normal 500 13px/20px Gilroy',
    letterSpacing: 0.26,
    color: theme.palette.neutral[3],
    textTransform: 'uppercase',
  }
}))

declare interface SummaryState {
  inScene: number
  uniqueVisitors: number
  faceMasks: number
  qrCodes: number
}

const defaultSummaryState: SummaryState = {
  inScene: 0,
  uniqueVisitors: 0,
  faceMasks: 0,
  qrCodes: 0,
}

const Summary: React.FC = () => {
  const classes = useStyles()
  const timeoutRef = React.useRef<number | null>(null)
  const [summary, setSummary] = React.useState<SummaryState>(defaultSummaryState)
  const { pushErrorFeedBack } = useFeedback()
  const { isPlaying } = usePipeline()

  async function fetchSummary() {
    try {
      const res = await fetch('/events/summary')
      if (!res.ok) {
        throw new Error(res.statusText)
      }
      setSummary(await res.json())
    }
    catch (err: any) {
      pushErrorFeedBack(err)
      setSummary(defaultSummaryState)
    }
    
  }

  function pollSummary() {
    fetchSummary()
    timeoutRef.current = window.setTimeout(pollSummary, 1.5 * 1000)
  }

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current != null) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])


  React.useEffect(() => {
    if (isPlaying) {
      pollSummary()
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
          <span className={classes.number}>2</span>
          <span className={classes.label}>People in scene</span>
        </div>
        <div className={classes.item}>
          <span className={classes.number}>16</span>
          <span className={classes.label}>Unique visitors</span>
        </div>
        <div className={classes.item}>
          <span className={classes.number}>13</span>
          <span className={classes.label}>Face mask detected</span>
        </div>
        <div className={classes.item}>
          <span className={classes.number}>9</span>
          <span className={classes.label}>QR Codes detected</span>
        </div>
      </div>
    </div>
  )
}

export default Summary