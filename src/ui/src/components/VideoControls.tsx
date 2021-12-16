import React from 'react'
import { makeStyles } from '@mui/styles'
import { Button, Theme } from '@mui/material'
import { usePipeline } from '../providers/Pipeline'

import { ReactComponent as PlayIcon } from '../assets/play.svg'
import { ReactComponent as PauseIcon } from '../assets/pause.svg'

const useStyles = makeStyles<Theme>(theme => ({
  root: {
    position: 'absolute',
    bottom: theme.spacing(4),
    right: theme.spacing(4)
  }
}))

const VideoControls: React.FC = () => {
  const classes = useStyles()
  const { isPlaying, pauseLiveStream, playLiveStream } = usePipeline()

  const toggleVideo = (): void => {
    if (isPlaying) {
      void pauseLiveStream()
    } else {
      playLiveStream()
    }
  }

  return (
    <div className={classes.root}>
      <Button size='small' variant='contained' color='primary' style={{ minWidth: 0 }} onClick={toggleVideo}>{isPlaying ? <PauseIcon /> : <PlayIcon />}</Button>
    </div>
  )
}

export default VideoControls
