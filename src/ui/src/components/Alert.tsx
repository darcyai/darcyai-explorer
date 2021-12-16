import React from 'react'
import { ReactComponent as ErrorIcon } from '../assets/alert-warning.svg'
import { ReactComponent as SuccessIcon } from '../assets/alert-confirm.svg'
import { ReactComponent as CloseIcon } from '../assets/close.svg'
import { makeStyles } from '@mui/styles'
import { SnackbarContent, Theme } from '@mui/material'
import clsx from 'clsx'
import { Feedback } from '../providers/Feedback'
import sharedStyles from '../Theme/sharesdStyles'

const variantIcon: Record<string, any> = {
  success: SuccessIcon,
  warning: ErrorIcon,
  error: ErrorIcon,
  info: ErrorIcon
}

const useStyles = makeStyles((theme: Theme) => ({
  ...sharedStyles(theme),
  success: {
    backgroundColor: `${theme.palette.success.main}!important`
  },
  error: {
    backgroundColor: `${theme.palette.error.main}!important`
  },
  info: {
    backgroundColor: `${theme.palette.info.main}!important`
  },
  warning: {
    backgroundColor: `${theme.palette.warning.main}!important`
  },
  icon: {
    minWidth: theme.spacing(4),
    minHeight: theme.spacing(4)
  },
  closeIcon: {
    marginRight: theme.spacing(1),
    cursor: 'pointer'
  },
  message: {
    fontFamily: 'Gilroy',
    color: theme.palette.neutral[5],
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    width: '100%',
    justifyContent: 'flex-start',
    lineBreak: 'anywhere'
  },
  alert: {
    borderRadius: 0,
    '--svg-color': theme.palette.neutral[5],
    minHeight: 64
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    position: 'fixed',
    minHeight: 64,
    width: theme.spacing(50),
    right: theme.spacing(8),
    top: theme.spacing(1),
    zIndex: 9999
  },
  snackMessage: {
    flex: 1
  }
}))

declare interface FeedbackAlert extends Feedback {
  onClose: () => void
  key?: string
  className?: string
}

export const Alert: React.FC<{ open: boolean, alerts: FeedbackAlert[] }> = (props) => {
  const classes: any = useStyles()
  const { open, alerts } = props

  return open
    ? (
      <div className={classes.container}>
        {alerts.map((a, idx) => {
          const handleClick = a.onClose
          const variantKey = a.type ?? 'info'
          const Icon = variantIcon[variantKey]
          return (
            <SnackbarContent
              key={a.key ?? a.id ?? idx}
              className={clsx(classes[variantKey], classes.alert, a.className)}
              aria-describedby='client-snackbar'
              message={
                <span id='client-snackbar' data-cy='Alert' className={classes.message}>
                  <Icon className={clsx(classes.icon, classes.iconVariant, classes.iconColor)} />
                  <span style={{ width: '100%', userSelect: 'all' }}>{a.message}</span>
                </span>
            }
              classes={{ message: classes.snackMessage }}
              action={[
                <CloseIcon key={1} onClick={handleClick} data-cy='AlertClose' className={clsx(classes.closeIcon, classes.iconColor)} />
              ]}
            />
          )
        })}
      </div>
      )
    : null
}

export default Alert
