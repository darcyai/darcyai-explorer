import React from 'react'
import { usePipeline } from '../providers/Pipeline'

import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: theme.spacing(31),
    overflowY: 'auto',
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
    color: theme.palette.neutral[2],
    minHeight: theme.spacing(5)
  },
  noConfigItem: {
    font: 'normal normal 500 13px/16px Gilroy',
    letterSpacing: 0,
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

const Config: React.FC = () => {
  const classes = useStyles()
  const { selectedStep, config } = usePipeline()

  return (
    <div className={classes.root}>
      {config.length === 0 && (
        <div className={classes.noConfigItem}>
          <span>There are no configurable options for {selectedStep}.</span>
        </div>
      )}
      {config.map(item => (
        <div key={item.name} className={classes.item}>
          <div>{item.description}</div>
          <div>{item.value.toString()}</div>
        </div>
      ))}
    </div>
  )
}

export default Config