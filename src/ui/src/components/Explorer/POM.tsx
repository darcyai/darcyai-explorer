import React from 'react'
import { usePipeline, Pulse, perceptorNameByStep } from '../../providers/Pipeline'
import { CollapsedFieldProps } from 'react-json-view'

import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material'
import ReactJSONView from '../JSONViewer'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
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
  }
}))

const POM: React.FC = () => {
  const classes = useStyles()
  const { pulses, showFrame, selectedStep, fetchPulses, isPlaying } = usePipeline()
  const [selectedPulse, setSelectedPulse] = React.useState<number | null>(null)
  const timeoutRef = React.useRef<number | null>(null)

  async function pollPulses() {
    try {
      await fetchPulses()
    }
    catch(e) {
      
    }
    timeoutRef.current = window.setTimeout(pollPulses, 1000)
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
      pollPulses()
    } else {
      showFrame(pulses[0].frame)
      if (timeoutRef.current != null) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [isPlaying])

  React.useEffect(() => {
    if (pulses.length === 0) {
      return
    }
    setSelectedPulse(pulses[0].id)
  }, [pulses])

  const selectPulse = (pulse: Pulse) => {
    setSelectedPulse(pulse.id)
    showFrame(pulse.frame)
  }

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
      {pulses.map(pulse => {
        return selectedPulse === pulse.id ? (
          <div key={pulse.id} className={classes.details}>
            <ReactJSONView src={pulse.pom} shouldCollapse={_shouldCollapse}/>
          </div>
        ) : (
          <div key={pulse.id} onClick={() => selectPulse(pulse)} className={classes.item}>
            Frame {pulse.id}
          </div>
        )
      })}
    </div>
  )
}

export default POM