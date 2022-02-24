import React from 'react'

import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material'

import { PipelineStep, usePipeline } from '../../providers/Pipeline'
import POMViewer from './POM'
import Events from './Events'
import Code from './Code'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    height: 0
  },
  title: {
    font: 'normal normal 500 13px/24px Gilroy',
    letterSpacing: 0.26,
    textTransform: 'uppercase',
    padding: theme.spacing(2, 2),
    height: theme.spacing(5),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    backgroundColor: theme.palette.neutral[5] ?? '' + '80',
    borderBottom: `1px solid ${theme.palette.border ?? ''}`,
    color: theme.palette.primary.main,
    cursor: 'pointer',
    '& .selected': {
      color: theme.palette.neutral[0]
    }
  },
  contentSection: {
    backgroundColor: theme.palette.neutral[4],
    flex: 1,
    minHeight: 0,
    [theme.breakpoints.up('md')]: {
      maxWidth: '50vw'
    }
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
  const { selectedStep, selectStep } = usePipeline()

  const selectEvents = (): void => {
    setTab(Tabs.EVENTS)
  }

  const selectPOM = async (): Promise<void> => {
    try {
      setTab(Tabs.POM)
    } catch (e) {
      console.error(e)
    }
  }

  const selectCode = (): void => {
    setTab(Tabs.CODE)
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
        {tab === Tabs.POM && <POMViewer />}
        {tab === Tabs.CODE && <Code />}
      </div>
    </div>
  )
}

export default Explorer
