import React from 'react'

import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material'

import { ReactComponent as PlayIcon } from '../assets/play.svg'
import { useFeedback } from '../providers/Feedback'
import { usePipeline } from '../providers/Pipeline'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
    display: 'flex',
    gap: theme.spacing(2),
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    width: theme.spacing(20.5),
  },
  itemContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  itemImgContainer: {
    width: '100%',
    position: 'relative'
  },
  itemImg: {
    width: '100%',
    height: theme.spacing(13.75),
    backgroundColor: theme.palette.neutral[2],
    borderRadius: theme.spacing(0.25),
  },
  itemImgOverlay: {
    width: '100%',
    height: theme.spacing(13.75),
    borderRadius: theme.spacing(0.25),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    borderColor: theme.palette.primary.main,
    border: '1px solid',
    backgroundColor: 'rgba(0,0,0,0.5)',
    cursor: 'pointer',
    '& svg': {
      '& path': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.main,
        fill: theme.palette.primary.main,
        stroke: theme.palette.primary.main,
      }
    },
    '&:hover': {
      border: '2px solid',
      borderColor: theme.palette.primary.main,
    }
  },
  itemTitle: {
    font: 'normal normal 500 12px/16px Gilroy',
    letterSpacing: 0,
    color: theme.palette.neutral[2],
    textTransform: 'uppercase',
  },
  itemDescription: {
    font: 'normal normal 500 12px/16px Gilroy',
    letterSpacing: 0
  },
}))

declare interface InputStreamInput {
  id: number
  title: string
  file?: string
  thumbnail? : string
  type: 'video_file' | 'live_feed'
  description: string,
}

const InputStreamConfig: React.FC = () => {
  const classes = useStyles()
  const [inputs, setInputs] = React.useState<InputStreamInput[]>([])
  const [currentInputId, setCurrentInputId] = React.useState<number>(0)
  const { pushErrorFeedBack } = useFeedback()
  const { pauseLiveStream, playLiveStream } = usePipeline()

  async function fetchInputs() {
    const res = await fetch('/inputs')
    if (!res.ok) { throw new Error(res.statusText) }
    const data = await res.json()
    setInputs(data.inputs)
    setCurrentInputId(data.current)
  }

  async function updateInput(inputId: number) {
    try {
      pauseLiveStream()
      const res = await fetch(`/inputs/${inputId}`, { method: 'PUT' })
      if (!res.ok) { throw new Error(res.statusText) }
      const data = await res.json()
      setInputs(data.inputs)
      setCurrentInputId(data.current)
      playLiveStream()
    }
    catch(e: any) {
      pushErrorFeedBack(e)
      playLiveStream()
    }
  }

  React.useEffect(() => {
    fetchInputs()
      .catch((e: any) => {
        pushErrorFeedBack(e)
        console.error(e)
        setInputs([])
      })
  }, [])

  return (
    <div className={classes.root}>
      {inputs.map((input) => (
        <div key={input.id} className={classes.item}>
          <div className={classes.itemImgContainer} >
            <img className={classes.itemImg} src={input.thumbnail ?? ''} />
            {currentInputId !== input.id && <div className={classes.itemImgOverlay} onClick={() => { updateInput(input.id) }}><PlayIcon /></div>}
          </div>
          <div className={classes.itemContent}>
            <span className={classes.itemTitle}>{input.title}</span>
            <span className={classes.itemDescription}>{input.description}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default InputStreamConfig