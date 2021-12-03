import React from 'react'

const liveFeedSrc = '/live_feed'

export declare interface ConfigItem {
  default_value: any
  description: string
  name: string
  type: string
  value: any
}

export declare interface EventItem {
  id: string
  timestamp: number
  event_type: string
  payload: any
}

export declare interface Pulse {
  id: number
  pom: any
  frame: string
}

declare interface PipelineProps {
  setShowDetails: (v: boolean) => void
}

declare interface Pipeline {
  imageSrc: string
  isPlaying: boolean
  pulses: Pulse[]
  events: EventItem[]
  config: ConfigItem[]
  selectedStep: PipelineStep | undefined
  hoveredStep: PipelineStep | undefined
  selectStep: (step?: PipelineStep) => void
  hoverStep: (step?: PipelineStep) => void
  playLiveStream: () => void
  pauseLiveStream: () => void
  showFrame: (frame: string) => void
  fetchPulses: () => Promise<void>
  fetchEvents: () => Promise<void>
}

const defaultValue: Pipeline = {
  imageSrc: liveFeedSrc,
  isPlaying: true,
  pulses: [],
  config: [],
  events: [],
  selectedStep: undefined,
  hoveredStep: undefined,
  selectStep: (step?: PipelineStep) => {},
  hoverStep: (step?: PipelineStep) => {},
  playLiveStream: () => {},
  pauseLiveStream: () => {},
  fetchPulses: async () => {},
  fetchEvents: async () => {},
  showFrame: (frame: string) => {},
}


export enum PipelineStep {
  INPUT = 'Input stream',
  PEOPLE = 'People perceptor',
  MASK = 'Mask perceptor',
  QRCODE = 'QR Code perceptor',
  CALLBACK = 'Callback',
  OUTPUT = 'Output stream'
}


export const perceptorNameByStep: (step: PipelineStep) => string = (step: PipelineStep) => {
  switch (step) {
    case PipelineStep.INPUT:
      return 'basic'
    case PipelineStep.PEOPLE:
      return 'basic'
    case PipelineStep.MASK:
      return 'basic'
    case PipelineStep.QRCODE:
      return 'basic'
    case PipelineStep.CALLBACK:
      return 'basic'
    case PipelineStep.OUTPUT:
      return 'basic'
    default:
      return ''
  }
}

const stepConfigURL: (step: PipelineStep) => string = (step: PipelineStep) => {
  switch (step) {
    case PipelineStep.INPUT:
      return ''
    case PipelineStep.PEOPLE:
      return `/perceptors/${perceptorNameByStep(step)}/config`
    case PipelineStep.MASK:
      return `/perceptors/${perceptorNameByStep(step)}/config`
    case PipelineStep.QRCODE:
      return `/perceptors/${perceptorNameByStep(step)}/config`
    case PipelineStep.CALLBACK:
      return `/perceptors/${perceptorNameByStep(step)}/config`
    case PipelineStep.OUTPUT:
      return `/outputs/${perceptorNameByStep(step)}/config`
    default:
      return ''
  }
}

const stepEventURL: (step: PipelineStep) => string = (step: PipelineStep) => {
  switch (step) {
    case PipelineStep.INPUT:
      return `/events/${perceptorNameByStep(step)}`
    case PipelineStep.PEOPLE:
      return `/events/${perceptorNameByStep(step)}`
    case PipelineStep.MASK:
      return `/events/${perceptorNameByStep(step)}`
    case PipelineStep.QRCODE:
      return `/events/${perceptorNameByStep(step)}`
    case PipelineStep.CALLBACK:
      return `/events/${perceptorNameByStep(step)}`
    case PipelineStep.OUTPUT:
      return `/events/${perceptorNameByStep(step)}`
    default:
      return ''
  }
}

export const PipelineContext = React.createContext(defaultValue)
export const usePipeline: () => Pipeline = () => React.useContext(PipelineContext)

export const PipelineProvider: React.FC<PipelineProps> = ({ setShowDetails, children }) => {
  const [imageSrc, setImageSrc] = React.useState < string > (liveFeedSrc)
  const [selectedStep, setSelectedStep] = React.useState<PipelineStep | undefined>(undefined)
  const [hoveredStep, setHoveredStep] = React.useState<PipelineStep | undefined>(PipelineStep.INPUT)
  const [pulses, setPulses] = React.useState<Pulse[]>([])
  const [events, setEvents] = React.useState<EventItem[]>([])
  const [config, setConfig] = React.useState<ConfigItem[]>([])
  const isPlaying = React.useMemo(() => !imageSrc.includes('base64'), [imageSrc])

  async function fetchPulses () {
    try {
      const res = await window.fetch('/pulses/history')
      const data = await res.json()
      setPulses(data)
    } catch (e) {
      console.error(e)
    }
  }

  async function fetchEvents () {
    if (selectedStep === undefined) {
      setEvents([])
      return
    }
    try {
      const res = await window.fetch(`${stepEventURL(selectedStep)}`)
      const data = await res.json()
      setEvents(data)
    } catch(e) {
      console.error(e)
    }
  }

  async function fetchPerceptorConfig(step: PipelineStep) {
    const url = stepConfigURL(step)
    if (url === '') { 
      setConfig([])
      return
    }
    const res = await window.fetch(`/pipeline/${url}`)
    const config = await res.json()
    setConfig(config)
  }

  async function pause() {
    try {
      const res = await window.fetch('/current_pulse')
      const data = await res.json()
      setImageSrc(data.frame)
    } catch (e) {
      console.error(e)
    }
  }

  React.useEffect(() => {
    if (selectedStep) {
      fetchPerceptorConfig(selectedStep)
      .catch(err => console.error(err))
    }
  }, [selectedStep])

  return (
    <PipelineContext.Provider
      value={{
        events,
        isPlaying,
        pulses,
        config,
        imageSrc,
        selectedStep,
        hoveredStep,
        selectStep: (step?: PipelineStep) => { setSelectedStep(step); setShowDetails(true) },
        hoverStep: (step?: PipelineStep) => setHoveredStep(step),
        playLiveStream: () => { setImageSrc(liveFeedSrc) },
        pauseLiveStream: () => { pause() },
        fetchPulses: async () => fetchPulses(),
        fetchEvents: async () => fetchEvents(),
        showFrame: (frame: string) => setImageSrc(frame)
      }}
    >
      {children}
    </PipelineContext.Provider>
  )
}
