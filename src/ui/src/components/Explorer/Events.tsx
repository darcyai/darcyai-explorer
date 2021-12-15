import React from 'react'

import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material'
import { usePipeline, EventItem } from '../../providers/Pipeline'
import moment from 'moment'
import ReactJSONView from '../JSONViewer'

import { ReactComponent as CollapsedIcon } from '../../assets/collapsed.svg'
import { ReactComponent as OpenedIcon } from '../../assets/opened.svg'

import clsx from 'clsx'
import sharedStyles from '../../Theme/sharesdStyles'

const useStyles = makeStyles((theme: Theme) => ({
  ...sharedStyles(theme),
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: theme.spacing(10)
  },
  details: {
    padding: theme.spacing(2),
    paddingLeft: theme.spacing(6),
    flex: 1,
  },
  noEventItem: {
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
  row: {
    display: 'flex',
    alignItems: 'center',
    font: 'normal normal 500 13px/16px Gilroy',
    letterSpacing: 0,
    color: theme.palette.neutral[2],
    cursor: 'pointer',
    borderBottom: `1px solid ${theme.palette.border ?? ''}`,
    flexWrap: 'wrap',
    padding: theme.spacing(1, 0),
    '--svg-color': theme.palette.primary.main
  },
  iconColumn: {
    width: theme.spacing(6),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateColumn: {
    width: theme.spacing(25),
    display: 'flex',
    alignItems: 'center',
  },
  eventColumn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.neutral[0],
  },
  title: {
    font: 'normal normal 500 13px/16px Gilroy',
    color: theme.palette.neutral[2],
    letterSpacing: 0.26,
    textTransform: 'uppercase',
  }
}))

function formatEvent(event: EventItem, formatedTimestamp: string) {
  return {
    type: event.event_type,
    timestamp: event.timestamp,
    date: formatedTimestamp,
    payload: event.payload
  }
}

const Events: React.FC = () => {
  const classes: any = useStyles()
  const [selectedEvent, setSelectedEvent] = React.useState<string>('')
  const { events, fetchEvents, selectedStep, isPlaying } = usePipeline()
  const timeoutRef = React.useRef<number | null>(null)

  async function pollEvents() {
    try {
      await fetchEvents()
    }
    catch (e) { }
    timeoutRef.current = window.setTimeout(pollEvents, 1.5 * 1000)
  }

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current != null) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  React.useEffect(() => {
    if (timeoutRef.current != null) {
      window.clearTimeout(timeoutRef.current)
    }
    if (isPlaying) {
      if (selectedStep != null) {
        pollEvents()
      }
    } else {
      fetchEvents()
    }
  }, [isPlaying, selectedStep])

  const selectEvent = (event: EventItem) => {
    setSelectedEvent(currentID => currentID === event.id ? '' : event.id)
  }

  return (
    <div className={classes.root}>
      <div className={classes.row}>
        <div className={classes.iconColumn}/>
        <div className={clsx(classes.dateColumn, classes.title)}>Date</div>
        <div className={clsx(classes.eventColumn, classes.title)}>Event</div>
      </div>
      {events.length === 0 && (
        <div className={classes.noEventItem}>
          <span>There are no events for {selectedStep}.</span>
        </div>
      )}
      {events.map(event => {
        const format = 'YYYY-MM-DD HH:mm:ss'
        const formatedTimestamp = moment.utc(event.timestamp * 1000).local().format(format)
        const selected = selectedEvent === event.id
        return (
          <div key={event.id} onClick={() => selectEvent(event)} className={classes.row}>
            <div className={classes.iconColumn}>{selected ? <OpenedIcon className={classes.iconColor} /> : <CollapsedIcon className={classes.iconColor} />}</div>
            <div className={classes.dateColumn}>{formatedTimestamp}</div>
            <div className={classes.eventColumn}>{event.event_type}</div>
            {selected && (
              <>
                <div style={{ flexBasis: '100%', height: 0 }} />
                <div key={event.id} className={classes.details} onClick={(e) => { e.stopPropagation(); e.preventDefault() }}>
                  <ReactJSONView src={formatEvent(event, formatedTimestamp)} />
                </div>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default Events