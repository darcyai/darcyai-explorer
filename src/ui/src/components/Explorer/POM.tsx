import React from 'react'
import { usePipeline, Pulse, perceptorNameByStep } from '../../providers/Pipeline'
import { CollapsedFieldProps } from 'react-json-view'

import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material'
import ReactJSONView from '../JSONViewer'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    height: '100%',
    minHeight: theme.spacing(10),
    flexDirection: 'column',
  },
  details: {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.border ?? ''}`,
  },
  item: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing(0, 2),
    justifyContent: 'space-between',
    borderBottom: `1px solid ${theme.palette.border ?? ''}`,
    font: 'normal normal 500 13px/16px Gilroy',
    letterSpacing: 0,
    cursor: 'pointer',
    color: theme.palette.neutral[2],
    minHeight: theme.spacing(5)
  },
  playingText: {
    font: 'normal normal 500 13px/16px Gilroy',
    letterSpacing: 0,
    flex: 1,
    color: theme.palette.neutral[2],
    textTransform: 'uppercase',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%'
  }
}))

const POM: React.FC = () => {
  const classes = useStyles()
  const { latestPulse, selectedStep, isPlaying, pauseLiveStream, playLiveStream } = usePipeline()

  // React.useEffect(() => {
  //   const wasPlaying = isPlaying
  //   pauseLiveStream()
  //   return () => {
  //      if (wasPlaying) { playLiveStream() }
  //   }
  // }, [])

  const _shouldCollapse = React.useMemo(() => (field: CollapsedFieldProps) => {
    if (field.name === 'root') {
      return false
    }
    if (selectedStep != null && field.name === perceptorNameByStep(selectedStep)) {
      return false
    }
    return true
  }, [selectedStep])

  return (
    <div className={classes.root}>
      { isPlaying ? 
        <div className={classes.playingText}><span>Pause the video to see the POM details</span></div> : 
        <div className={classes.details}>
          <ReactJSONView src={latestPulse?.pom ?? {}} shouldCollapse={_shouldCollapse}/>
        </div>
      }
    </div>
  )
}

export default POM