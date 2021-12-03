import React from 'react'
import { makeStyles } from '@mui/styles'
import { Button, Theme } from '@mui/material'
import { usePipeline } from '../providers/Pipeline'

import { ReactComponent as PlayIcon } from '../assets/next.svg'

const useStyles = makeStyles<Theme>(theme => ({
  root: {
    position: 'absolute',
    bottom: theme.spacing(4),
    right: theme.spacing(4),
  }
}))

const VideoControls: React.FC = () => {
  const classes = useStyles()
  const { imageSrc, isPlaying, pauseLiveStream, playLiveStream } = usePipeline()

  const toggleVideo = () => {
    if (isPlaying) {
      pauseLiveStream()
    } else {
      playLiveStream()
    }
  }

  return (
    <div className={classes.root}>
      <Button size='small' variant='contained' color='primary' style={{ minWidth: 0 }} onClick={toggleVideo}>{isPlaying ? '||' : <PlayIcon />}</Button>
    </div>
  )
}

export default VideoControls