import React from 'react'

import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material'

import clsx from 'clsx'
import { PipelineStep, usePipeline } from '../../providers/Pipeline'
import POM from './POM'
import Events from './Events'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    height: 0,
  },
  title: {
    font: 'normal normal 500 13px/24px Gilroy',
    letterSpacing: 0.26,
    textTransform: 'uppercase',
    padding: theme.spacing(0, 2),
    height: theme.spacing(5),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    backgroundColor: theme.palette.neutral[5] + '80',
    borderBottom: `1px solid ${theme.palette.border ?? ''}`,
    color: theme.palette.primary.main,
    cursor: 'pointer',
    '& .selected': {
      color: theme.palette.neutral[0],
    }
  },
  contentSection: {
    backgroundColor: theme.palette.neutral[4],
    flex: 1,
    overflowY: 'auto',
    minHeight: 0,
  }
}))

const enum Tabs {
  EVENTS = 'events',
  POM = 'pom',
  CODE = 'code',
}

const Explorer: React.FC = () => {
  const classes = useStyles()
  const [tab, setTab] = React.useState<Tabs>(Tabs.EVENTS)
  const { playLiveStream, selectedStep, selectStep } = usePipeline()

  const selectEvents = () => {
    setTab(Tabs.EVENTS)
    playLiveStream()
  }

  const selectPOM = async () => {
    try {
      setTab(Tabs.POM)
    } catch (e) {
      console.error(e)
    }
  }

  const selectCode = () => {
    setTab(Tabs.CODE)
    playLiveStream()
  }

  React.useEffect(() => {
    if (selectedStep === undefined) {
      selectStep(PipelineStep.INPUT)
    }
  }, [])

  return (
    <div className={classes.root}>
      <div className={classes.title}>
        <span className={tab === Tabs.EVENTS ? 'selected' : ''} onClick={selectEvents}>{Tabs.EVENTS}</span>
        <span className={tab === Tabs.POM ? 'selected' : ''} onClick={selectPOM}>{Tabs.POM}</span>
        <span className={tab === Tabs.CODE ? 'selected' : ''} onClick={selectCode}>{Tabs.CODE}</span>
      </div>
      <div className={classes.contentSection}>
        {tab === Tabs.EVENTS && <Events />}
        {tab === Tabs.POM && <POM />}
        {tab === Tabs.CODE && <div>Code</div>}
      </div>
    </div>
  )
}

export default Explorer