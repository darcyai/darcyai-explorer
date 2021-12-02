import React from 'react'
import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material'
import { usePipeline } from '../providers/Pipeline'

import { ReactComponent as CloseIcon } from '../assets/close.svg'
import sharedStyles from '../Theme/sharesdStyles'
import clsx from 'clsx'

export interface DetailsProps {
  close: () => void
}

const useStyles = makeStyles((theme: Theme) => ({
  ...sharedStyles(theme),
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  title: {
    minHeight: theme.spacing(8),
    padding: theme.spacing(2),
    font: 'normal normal 500 17px/24px Gilroy',
    letterSpacing: '0.34px',
    textTransform: 'uppercase',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `1px solid ${theme.palette.border ?? ''}`,
  },
}))

const Details: React.FC<DetailsProps> = ({ close }) => {
  const classes: any = useStyles()
  const { pom, selectedStep } = usePipeline()

  return (
    <div className={classes.root}>
      <div className={classes.title}>
        <span>{selectedStep}</span>
        <CloseIcon onClick={close} className={clsx(classes.iconColor, classes.actionIcon)} />
      </div>
    </div>
  )
}

export default Details