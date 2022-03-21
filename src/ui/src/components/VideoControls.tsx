import React from 'react'
import { makeStyles } from '@mui/styles'
import { Button, Theme } from '@mui/material'
import { usePipeline } from '../providers/Pipeline'

import { ReactComponent as PlayIcon } from '../assets/play.svg'
import { ReactComponent as PauseIcon } from '../assets/pause.svg'
import Spinner from './Spinner'

const useStyles = makeStyles<Theme>(theme => ({
  playButton: {
    position: 'absolute',
    bottom: theme.spacing(4),
    right: theme.spacing(4)
  },
  spinner: {
    position: 'absolute',
    top: 'calc(50% - 2px)',
    left: 'calc(50% - 10px)',
    transform: 'translate(-50%, -50%)'
  },
  root: {}
}))

const VideoControls: React.FC = () => {
  const classes = useStyles()
  const { isPlaying, pauseLiveStream, playLiveStream, loading } = usePipeline()

  const toggleVideo = (): void => {
    if (isPlaying) {
      void pauseLiveStream()
    } else {
      playLiveStream()
    }
  }

  if (loading) {
    return <div className={classes.spinner}><Spinner size={48} /></div>
  }

  return (
    <Button className={classes.playButton} size='small' variant='contained' color='primary' style={{ minWidth: 0, position: 'absolute' }} onClick={toggleVideo}>{isPlaying ? <PauseIcon /> : <PlayIcon />}</Button>
  )
}

export default VideoControls
