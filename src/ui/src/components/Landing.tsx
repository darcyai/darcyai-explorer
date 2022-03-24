import React from 'react'
import { makeStyles } from '@mui/styles'
import { Button, Theme } from '@mui/material'
import Pipeline from './Pipeline'

import { ReactComponent as InspectIcon } from '../assets/inspect.svg'
import { usePipeline, PipelineStep } from '../providers/Pipeline'
import liveIcon from '../assets/live.svg'
import VideoControls from './VideoControls'
import Summary from './Summary'
import clsx from 'clsx'

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      display: 'flex',
      backgroundColor: theme.palette.primary.main,
      flexDirection: 'column',
      [theme.breakpoints.up('md')]: {
        flex: 1,
        zIndex: 5,
        boxShadow: '0px 3px 80px 0 rgba(0, 0, 0, 0.5)'
      }
    },
    header: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      gap: theme.spacing(4),
      padding: theme.spacing(0, 2),
      background: 'transparent linear-gradient(180deg, #0F2C42 0%, #1C405C 100%) 0% 0% no-repeat padding-box'
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
        marginBottom: 0
      }
    },
    pipelineTitle: {
      font: 'normal normal normal 17px/26px Gilroy',
      letterSpacing: '0.34px',
      textTransform: 'uppercase',
      alignSelf: 'flex-start',
      height: theme.spacing(8),
      display: 'flex',
      alignItems: 'center'
    },
    headerBottomSection: {
      borderTop: `2px solid ${theme.palette.border ?? ''}`,
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
      paddingRight: theme.spacing(17),
      width: '100%',
      position: 'relative',
      minHeight: theme.spacing(16.5),
      display: 'flex',
      flexDirection: 'column',
      '&.wide': {
        paddingRight: theme.spacing(2)
      }
    },
    infoText: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(1),
      height: '100%',
      flex: 1
    },
    infoTextTitle: {
      font: 'normal normal medium 13px/24px Gilroy',
      letterSpacing: '0.26px',
      textTransform: 'uppercase'
    },
    infoTextContent: {
      font: 'normal normal normal 13px/21px Gilroy',
      letterSpacing: '0.26px'
    },
    videoSection: {
      position: 'relative',
      backgroundColor: theme.palette.neutral[4],
      paddingTop: '75%',
      width: '100%',
      minHeight: theme.spacing(20),
      lineHeight: 0,
      display: 'flex',
      justifyContent: 'center',
      '& img': {
        position: 'absolute',
        top: 0,
        width: '100%',
        backgroundImage: `url(${liveIcon})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: '100px 50px'
      },
      '& img:before': {
        content: ' ',
        display: 'block',
        position: 'absolute',
        backgroundImage: `url(${liveIcon})`
      },
      [theme.breakpoints.up('md')]: {
        minHeight: theme.spacing(40)
      }
    },
    pipelineContainer: {
      width: '100%',
      maxWidth: 954
    },
    summarySection: {
      minHeight: theme.spacing(11),
      backgroundColor: theme.palette.primary.main,
      borderTop: `1px solid ${theme.palette.neutral[5] ?? ''}`,
      [theme.breakpoints.up('md')]: {
        flex: 1
      }
    },
    stickyContainer: {
      position: 'sticky',
      top: 0,
      backgroundColor: theme.palette.primary.main
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
  [PipelineStep.OUTPUT]: 'Stream your video to your phone or computer.'
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

  const _imgError: React.ReactEventHandler<HTMLImageElement> = (e) => {
    const img: HTMLImageElement = e.currentTarget
    if (img.src !== '') {
      img.src = ''
      img.alt = ''
    }
  }

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        {selectedStep !== undefined
          ? <div className={classes.pipelineTitle}>Darcy AI pipeline</div>
          : (
            <div className={classes.titles}>
              <h1>Easily build your own AI apps (like this one!) using the Darcy AI SDK</h1>
              <h2>Click the Darcy AI pipeline below to see how this app was built</h2>
            </div>
            )}
        <div className={classes.pipelineContainer}>
          <Pipeline />
        </div>
        <div className={clsx(classes.headerBottomSection, !showInspect ? 'wide' : '')}>
          {infoText}
          {showInspect && <Button style={{ position: 'absolute', bottom: 16, right: 0, display: 'flex', gap: 8 }} onClick={inspect} size='small' variant='contained' color='primary'><InspectIcon /><span>Inspect</span></Button>}
        </div>
      </div>
      <div className={classes.stickyContainer}>
        <div className={classes.videoSection}>
          <img src={imageSrc} alt='live_feed' onError={_imgError} />
          <VideoControls />
        </div>
        <div className={classes.summarySection}>
          <Summary detailsOpened={!showInspect} />
        </div>
      </div>
    </div>
  )
}

export default Landing
