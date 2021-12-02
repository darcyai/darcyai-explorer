import React from 'react'
import { makeStyles } from '@mui/styles'
import { Button, Theme } from '@mui/material'
import Pipeline from './Pipeline'

import { ReactComponent as InspectIcon } from '../assets/inspect.svg'
import { usePipeline, PipelineStep } from '../providers/Pipeline'

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    }, 
    header: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      gap: theme.spacing(4),
      padding: theme.spacing(0, 2),
      background: 'transparent linear-gradient(180deg, #0F2C42 0%, #1C405C 100%) 0% 0% no-repeat padding-box',
    },
    titles: {
      textAlign: 'center',
      '& h1': {
        font: 'normal normal normal 26px/26px Gilroy',
        letterSpacing: '0.52px'
      },
      '& h2': {
        font: 'normal normal normal 14px/21px Gilroy',
        letterSpacing: '0.28px',
        color: theme.palette.primary.main,
        textTransform: 'uppercase',
        marginBottom: 0,
      }
    },
    pipelineTitle:{
      font: 'normal normal normal 17px/26px Gilroy',
      letterSpacing: '0.34px',
      textTransform: 'uppercase',
      alignSelf: 'flex-start',
      height: theme.spacing(8),
      display: 'flex',
      alignItems: 'center',
    },
    headerBottomSection: {
      borderTop: `2px solid ${theme.palette.border ?? ''}`,
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
      width: '100%',
      position: 'relative',
      minHeight: theme.spacing(12),
    },
    infoText: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(1),
    },
    infoTextTitle: {
      font: 'normal normal medium 13px/24px Gilroy',
      letterSpacing: '0.26px',
      textTransform: 'uppercase',
    },
    infoTextContent: {
      font: 'normal normal normal 13px/21px Gilroy',
      letterSpacing: '0.26px',
    }
  }
})

export interface LandingProps {
  inspect: () => void
  showInspect: boolean
}

const infoTextByStep: Record<PipelineStep, string> = {
  [PipelineStep.INPUT]: 'Take the live feed from your webcam or upload a video file',
  [PipelineStep.PEOPLE]: 'Easily detect faces, bodies and poses and face direction. Identify and track unique individuals and unique visits. All right out of the box with Darcy AI.',
  [PipelineStep.MASK]: 'Easily detect face masks. All right out of the box with Darcy AI.',
  [PipelineStep.QRCODE]: 'Read QRCodes. All right out of the box with Darcy AI.',
  [PipelineStep.CALLBACK]: 'Annotate your frames with custom data.',
  [PipelineStep.OUTPUT]: 'Stream your video to your phone or computer.',
}

const Landing: React.FC<LandingProps> = ({ inspect, showInspect }) => {
  const classes = useStyles()
  const { selectedStep, hoveredStep, imageSrc } = usePipeline()

  const infoText = React.useMemo(() => {
    const step = hoveredStep ?? selectedStep ?? null
    if (step === null) { return null }
    return (
      <div className={classes.infoText}>
        <div className={classes.infoTextTitle}>{step}</div>
        <div className={classes.infoTextContent}>{infoTextByStep[step]}</div>
      </div>
    )
  }, [selectedStep, hoveredStep])

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        {selectedStep ? 
          <div className={classes.pipelineTitle}>Darcy AI pipeline</div> :
          <div className={classes.titles}>
            <h1>Easily build your own AI apps (like this one!) using the Darcy AI SDK</h1>
            <h2>Click the Darcy AI pipeline below to see how this app was built</h2>
          </div>
        }
        <Pipeline />
        <div className={classes.headerBottomSection}>
          {infoText}
          {showInspect && <Button style={{ position: 'absolute', bottom: 16, right: 0, display: 'flex', gap: 8 }} onClick={inspect} size='small' variant='contained' color='primary'><InspectIcon /><span>Inspect</span></Button>}
        </div>
      </div>
      <img src={imageSrc} alt='live_feed' />
    </div>
  )
}

export default Landing