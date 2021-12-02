import React from 'react'
import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material'
import { usePipeline } from '../providers/Pipeline'

import { ReactComponent as CloseIcon } from '../assets/close.svg'
import { ReactComponent as ExpendIcon } from '../assets/close.svg'
import { ReactComponent as CollapseIcon } from '../assets/close.svg'
import sharedStyles from '../Theme/sharesdStyles'
import clsx from 'clsx'
import Config from './Config'

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
  configTitle: {
    font: 'normal normal 500 13px/24px Gilroy',
    letterSpacing: 0.26,
    textTransform: 'uppercase',
    padding: theme.spacing(0, 2),
    height: theme.spacing(5),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.palette.neutral[5],
    borderBottom: `1px solid ${theme.palette.border ?? ''}`,
  },
  configContainer: {
    display: 'flex',
    flexDirection: 'column',
  }
}))

const Details: React.FC<DetailsProps> = ({ close }) => {
  const classes: any = useStyles()
  const { pom, selectedStep } = usePipeline()
  const [showConfig, setShowConfig] = React.useState<boolean>(true)

  return (
    <div className={classes.root}>
      <div className={classes.title}>
        <span>{selectedStep}</span>
        <CloseIcon onClick={close} className={clsx(classes.iconColor, classes.actionIcon)} />
      </div>
      <div className={classes.configContainer}>
        <div className={classes.configTitle}>
          <span>Config</span>
          {showConfig ?
            <ExpendIcon onClick={() => setShowConfig(false)} className={clsx(classes.iconColor, classes.actionIcon)} /> :
            <CollapseIcon onClick={() => setShowConfig(true)} className={clsx(classes.iconColor, classes.actionIcon)} />
          }
        </div>
        {showConfig && <Config />}
      </div>
    </div>
  )
}

export default Details