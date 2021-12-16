import React, { ReactElement } from 'react'
import { ConfigItem, PipelineStep, usePipeline } from '../providers/Pipeline'

import { makeStyles } from '@mui/styles'
import { OutlinedInput, Theme } from '@mui/material'

import clsx from 'clsx'
import InputStreamConfig from './InputStreamConfig'

import { ReactComponent as CheckIcon } from '../assets/check.svg'
import sharedStyles from '../Theme/sharesdStyles'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: theme.spacing(31),
    overflowY: 'auto',
    borderBottom: `1px solid ${theme.palette.border ?? ''}`
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
  },
  input: {
  }
}))

const useToggleStyles = makeStyles((theme: Theme) => ({
  ...sharedStyles(theme),
  root: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid',
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
    padding: 1,
    cursor: 'pointer',
    gap: 1,
    borderRadius: theme.spacing(0.25),
    '--svg-color': theme.palette.primary.main,
    '&:hover': {
      borderColor: theme.palette.neutral[0],
      '--svg-color': theme.palette.neutral[0],
      color: theme.palette.neutral[0],
      '& .filled': {
        backgroundColor: theme.palette.neutral[0]
      }
    }
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    '&.filled': {
      backgroundColor: theme.palette.primary.main
    }
  }
}))

const Toggle: React.FC<{value: boolean, onChange: (newValue: boolean) => void, onBlur: any}> = ({ value, onChange, onBlur }) => {
  const classes: any = useToggleStyles()

  const _onChange = (): void => {
    onChange(!value)
    onBlur()
  }

  return (
    <div className={classes.root} onClick={_onChange}>
      <div>{value ? <div className={classes.item}><CheckIcon className={(clsx(classes.iconColor))} /></div> : <div className={clsx(classes.item, 'filled')} style={{ opacity: 0.5 }} />}</div>
      <div>{value ? <div className={clsx(classes.item, 'filled')} /> : <div className={classes.item} />}</div>
    </div>
  )
}

const Config: React.FC = () => {
  const classes = useStyles()
  const { selectedStep, config, updateConfig, saveConfig } = usePipeline()

  const configInputByType = (configItem: ConfigItem): ReactElement => {
    switch (configItem.type) {
      case 'int':
      case 'float':
        return <OutlinedInput size='small' className={classes.input} type='number' value={configItem.value} onChange={(e) => { updateConfig(configItem, e.target.value) }} onBlur={() => { saveConfig().catch(() => {}) }} />
      case 'str':
        return <OutlinedInput size='small' className={classes.input} type='text' value={configItem.value} onChange={(e) => { updateConfig(configItem, e.target.value) }} onBlur={() => { saveConfig().catch(() => {}) }} />
      case 'bool':
        return (
          <Toggle value={configItem.value} onChange={(value) => { updateConfig(configItem, value) }} onBlur={() => { saveConfig().catch(() => {}) }} />
        )
      default:
        return <span>{JSON.stringify(configItem.value)}</span>
    }
  }

  // This is dirty
  if (selectedStep === PipelineStep.INPUT) { return <div className={classes.root}><InputStreamConfig /></div> }

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
          <div>{configInputByType(item)}</div>
        </div>
      ))}
    </div>
  )
}

export default Config
