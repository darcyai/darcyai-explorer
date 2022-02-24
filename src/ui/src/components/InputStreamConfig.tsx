import React from 'react'

import { makeStyles } from '@mui/styles'
import { Theme, OutlinedInput } from '@mui/material'

import { ReactComponent as PlayIcon } from '../assets/play.svg'
import { useFeedback } from '../providers/Feedback'
import { usePipeline } from '../providers/Pipeline'
import { Toggle } from './Config'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column'
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    width: theme.spacing(20.5)
  },
  itemContent: {
    display: 'flex',
    flexDirection: 'column'
  },
  itemImgContainer: {
    width: '100%',
    position: 'relative'
  },
  itemImg: {
    width: '100%',
    height: theme.spacing(13.75),
    backgroundColor: theme.palette.neutral[2],
    borderRadius: theme.spacing(0.25)
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
        stroke: theme.palette.primary.main
      }
    },
    '&:hover': {
      border: '2px solid',
      borderColor: theme.palette.primary.main
    }
  },
  itemTitle: {
    font: 'normal normal 500 12px/16px Gilroy',
    letterSpacing: 0,
    color: theme.palette.neutral[2],
    textTransform: 'uppercase'
  },
  itemDescription: {
    font: 'normal normal 500 12px/16px Gilroy',
    letterSpacing: 0
  },
  inputRow: {
    display: 'flex',
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.border ?? ''}`,
    gap: theme.spacing(2)
  },
  configRow: {
    display: 'flex',
    padding: theme.spacing(0, 2),
    gap: theme.spacing(2)
  },
  configItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    font: 'normal normal 500 13px/16px Gilroy',
    letterSpacing: 0,
    color: theme.palette.neutral[2],
    minHeight: theme.spacing(5)
  }
}))

declare interface InputStreamInput {
  id: number
  title: string
  file?: string
  thumbnail?: string
  type: 'video_file' | 'live_feed'
  video_device?: string
  description: string
}

const InputStreamConfig: React.FC = () => {
  const classes = useStyles()
  const [inputs, setInputs] = React.useState<InputStreamInput[]>([])
  const [currentInputId, setCurrentInputId] = React.useState<number>(0)
  const { pushErrorFeedBack } = useFeedback()
  const { pauseLiveStream, playLiveStream } = usePipeline()
  const [processAllFrames, setProcessAllFrames] = React.useState<boolean>(false)
  const [videoDevice, setVideoDevice] = React.useState<string>('')
  const currentInput = React.useMemo(() => {
    const input = inputs.find(input => input.id === currentInputId)
    if ((input != null) && input.type === 'live_feed') {
      setVideoDevice(input.video_device ?? '')
    }
    return input
  }, [currentInputId])

  async function fetchInputs (): Promise<void> {
    const res = await fetch('/inputs')
    if (!res.ok) { throw new Error(res.statusText) }
    const data = await res.json()
    setInputs(data.inputs)
    setCurrentInputId(data.current)
  }

  async function updateInput (inputId: number, _processAllFrames?: boolean, _videoDevice?: string): Promise<void> {
    try {
      await pauseLiveStream()
      const res = await fetch(`/inputs/${inputId}`, {
        method: 'PUT',
        body: JSON.stringify({ process_all_frames: _processAllFrames ?? processAllFrames, video_device: _videoDevice ?? videoDevice }),
        headers: { 'Content-Type': 'application/json' }
      })
      if (!res.ok) {
        pushErrorFeedBack(res as any)
        return
      }
      const data = await res.json()
      setInputs(data.inputs)
      setCurrentInputId(data.current)
      playLiveStream()
    } catch (e: any) {
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

  const onEnterPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      void updateInput(currentInputId)
    }
  }

  return (
    <div className={classes.root}>
      <div className={classes.inputRow}>
        {inputs.map((input) => (
          <div key={input.id} className={classes.item}>
            <div className={classes.itemImgContainer}>
              <img className={classes.itemImg} src={input.thumbnail ?? ''} />
              {currentInputId !== input.id && <div className={classes.itemImgOverlay} onClick={() => { void updateInput(input.id) }}><PlayIcon /></div>}
            </div>
            <div className={classes.itemContent}>
              <span className={classes.itemTitle}>{input.title}</span>
              <span className={classes.itemDescription}>{input.description}</span>
            </div>
          </div>
        ))}
      </div>
      {currentInput?.type === 'video_file' && (
        <div className={classes.configRow}>
          <div className={classes.configItem}>
            <div>Process all video frames</div>
            <div>
              <Toggle value={processAllFrames} onChange={(value) => { setProcessAllFrames(value) }} onBlur={(value: boolean) => { void updateInput(currentInputId, value) }} />
            </div>
          </div>
        </div>
      )}
      {currentInput?.type === 'live_feed' && (
        <div className={classes.configRow}>
          <div className={classes.configItem}>
            <div>Video device</div>
            <OutlinedInput size='small' type='text' value={videoDevice} onChange={(e) => { setVideoDevice(e.target.value) }} onKeyPress={onEnterPress} onBlur={() => { void updateInput(currentInputId) }} />
          </div>
        </div>
      )}
    </div>
  )
}

export default InputStreamConfig
