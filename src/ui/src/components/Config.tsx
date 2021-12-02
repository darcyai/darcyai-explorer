import React from 'react'
import { usePipeline } from '../providers/Pipeline'

import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
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
    height: theme.spacing(5)
  }
}))

const Config: React.FC = () => {
  const classes = useStyles()
  const { selectedStep, config } = usePipeline()

  return (
    <div className={classes.root}>
      {config.map(item => (
        <div key={item.name} className={classes.item}>
          <div>{item.description}</div>
          <div>{item.value}</div>
        </div>
      ))}
    </div>
  )
}

export default Config