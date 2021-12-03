import React from 'react'
import { usePipeline, Pulse } from '../../providers/Pipeline'

import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material'

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
  const { pulses, showFrame } = usePipeline()
  const [selectedPulse, setSelectedPulse] = React.useState<number | null>(null)

  React.useEffect(() => {
    if (pulses.length === 0) {
      return
    }
    setSelectedPulse(pulses[0].id)
    showFrame(pulses[0].frame)
  }, [pulses])

  const selectPulse = (pulse: Pulse) => {
    setSelectedPulse(pulse.id)
    showFrame(pulse.frame)
  }

  return (
    <div className={classes.root}>
      {pulses.map(pulse => {
        return selectedPulse === pulse.id ? (
          <div key={pulse.id} className={classes.details}>
            {JSON.stringify(pulse.pom)}
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