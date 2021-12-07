import React from 'react'

import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material'
import { usePipeline, EventItem } from '../../providers/Pipeline'
import moment from 'moment'
import ReactJSONView from '../JSONViewer'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
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
  const classes = useStyles()
  const [selectedEvent, setSelectedEvent] = React.useState<string>('')
  const { events, fetchEvents, selectedStep, isPlaying } = usePipeline()
  const timeoutRef = React.useRef<number | null>(null)

  function pollEvents() {
    fetchEvents()
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
    setSelectedEvent(event.id)
  }

  return (
    <div className={classes.root}>
      {events.length === 0 && (
        <div className={classes.noEventItem}>
          <span>There are no events for {selectedStep}.</span>
        </div>
      )}
      {events.map(event => {
        const format = 'YYYY-MM-DD HH:mm:ss'
        const formatedTimestamp = moment.utc(event.timestamp * 1000).local().format(format)
        return selectedEvent === event.id ? (
          <div key={event.id} className={classes.details}>
            <ReactJSONView src={formatEvent(event, formatedTimestamp)} />
          </div>
        ) : (
          <div key={event.id} onClick={() => selectEvent(event)} className={classes.item}>
            <span>{formatedTimestamp}</span>
            <span>{event.event_type}</span>
          </div>
        )
      })}
    </div>
  )
}

export default Events