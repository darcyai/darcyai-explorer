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
    overflowY: 'auto',
    minHeight: theme.spacing(10)
  },
  details: {
    padding: theme.spacing(0),
    paddingLeft: theme.spacing(4),
    paddingBottom: theme.spacing(1),
    [theme.breakpoints.up('md')]: {
      paddingLeft: theme.spacing(6)
    },
    flex: 1
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
    width: '100%',
    padding: theme.spacing(4, 0)
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    font: 'normal normal 500 13px/16px Gilroy',
    letterSpacing: 0,
    gap: theme.spacing(1),
    color: theme.palette.neutral[2],
    cursor: 'pointer',
    borderBottom: `1px solid ${theme.palette.border ?? ''}`,
    flexWrap: 'wrap',
    padding: theme.spacing(1, 0),
    '--svg-color': theme.palette.primary.main
  },
  iconColumn: {
    width: theme.spacing(3),
    [theme.breakpoints.up('md')]: {
      width: theme.spacing(5)
    },
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  dateColumn: {
    width: theme.spacing(15),
    [theme.breakpoints.up('md')]: {
      width: theme.spacing(25)
    },
    display: 'flex',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    alignItems: 'center'
  },
  eventColumn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    maxWidth: theme.spacing(40),
    color: theme.palette.neutral[0]
  },
  payloadColumn: {
    flex: 1,
    alignItems: 'center',
    color: theme.palette.neutral[0],
    display: 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: theme.spacing(40),
    [theme.breakpoints.up('md')]: {
      display: 'flex'
    }
  },
  title: {
    font: 'normal normal 500 13px/16px Gilroy',
    color: theme.palette.neutral[2],
    letterSpacing: 0.26,
    textTransform: 'uppercase'
  },
  icon: {
    marginLeft: theme.spacing(1)
  }
}))

function formatEvent (event: EventItem, formatedTimestamp: string): {} {
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
  // Using a ref to avoid memoization of the isPlaying value.
  const isPlayingRef = React.useRef<boolean>(isPlaying)

  async function pollEvents (): Promise<void> {
    console.log('Polling events', { isPlayingRef: isPlayingRef.current, isPlaying })
    if (!isPlayingRef.current) { return } // Using a ref to avoid memoization of the isPlaying value.
    try {
      await fetchEvents()
    } catch (e) {
      console.error('Error while polling events', e)
    }
    timeoutRef.current = window.setTimeout(() => { void pollEvents() }, 1.5 * 1000)
  }

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current != null) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  React.useEffect(() => {
    isPlayingRef.current = isPlaying
    if (isPlaying) {
      void pollEvents()
    } else {
      if (timeoutRef.current != null) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [isPlaying])

  const selectEvent = (event: EventItem): void => {
    setSelectedEvent(currentID => currentID === event.id ? '' : event.id)
  }

  return (
    <div className={classes.root}>
      <div className={classes.row}>
        <div className={classes.iconColumn} />
        <div className={clsx(classes.dateColumn, classes.title)}>Date</div>
        <div className={clsx(classes.eventColumn, classes.title)}>Event</div>
        <div className={clsx(classes.payloadColumn, classes.title)}>Payload</div>
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
            <div className={classes.iconColumn}>{selected ? <OpenedIcon className={clsx(classes.icon, classes.iconColor)} /> : <CollapsedIcon className={clsx(classes.icon, classes.iconColor)} />}</div>
            <div className={classes.dateColumn}>{formatedTimestamp}</div>
            <div className={classes.eventColumn}>{event.event_type}</div>
            {selected
              ? (
                <>
                  <div style={{ flexBasis: '100%', height: 0 }} />
                  <div key={event.id} className={classes.details} onClick={(e) => { e.stopPropagation(); e.preventDefault() }}>
                    <ReactJSONView src={formatEvent(event, formatedTimestamp)} />
                  </div>
                </>
                )
              : <div className={classes.payloadColumn}>{JSON.stringify(event.payload)}</div>}
          </div>
        )
      })}
    </div>
  )
}

export default Events
