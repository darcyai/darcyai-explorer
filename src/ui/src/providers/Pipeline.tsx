import React from 'react'
import { useFeedback } from './Feedback'

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

export declare interface SummaryState {
  inScene: number
  visitors: number
  faceMasks: number
  qrCodes: number
}

const defaultSummaryState: SummaryState = {
  inScene: 0,
  visitors: 0,
  faceMasks: 0,
  qrCodes: 0
}

declare interface PipelineProps {
  setShowDetails: (v: boolean) => void
}

declare interface Pipeline {
  imageSrc: string
  isPlaying: boolean
  summary: SummaryState
  latestPulse?: Pulse
  events: EventItem[]
  config: ConfigItem[]
  selectedStep: PipelineStep | undefined
  hoveredStep: PipelineStep | undefined
  selectStep: (step?: PipelineStep) => void
  hoverStep: (step?: PipelineStep) => void
  playLiveStream: () => void
  pauseLiveStream: () => Promise<void>
  showFrame: (frame: string) => void
  fetchEvents: () => Promise<void>
  updateConfig: (key: ConfigItem, value: any) => void
  saveConfig: () => Promise<void>
  fetchSummary: () => Promise<void>
}

const defaultValue: Pipeline = {
  imageSrc: liveFeedSrc,
  isPlaying: true,
  latestPulse: undefined,
  summary: defaultSummaryState,
  config: [],
  events: [],
  selectedStep: undefined,
  hoveredStep: undefined,
  selectStep: (step?: PipelineStep) => {},
  hoverStep: (step?: PipelineStep) => {},
  playLiveStream: () => {},
  pauseLiveStream: async () => {},
  fetchEvents: async () => {},
  showFrame: (frame: string) => {},
  updateConfig: (key: ConfigItem, value: any) => {},
  saveConfig: async () => {},
  fetchSummary: async () => {}
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
      return 'people'
    case PipelineStep.MASK:
      return 'facemask'
    case PipelineStep.QRCODE:
      return 'qrcode'
    case PipelineStep.CALLBACK:
      return 'basic'
    case PipelineStep.OUTPUT:
      return 'live_feed'
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
      return ''
    case PipelineStep.OUTPUT:
      return `/outputs/${perceptorNameByStep(step)}/config`
    default:
      return ''
  }
}

const stepEventURL: (step: PipelineStep) => string = (step: PipelineStep) => {
  switch (step) {
    case PipelineStep.PEOPLE:
      return `/events/${perceptorNameByStep(step)}`
    case PipelineStep.MASK:
      return `/events/${perceptorNameByStep(step)}`
    case PipelineStep.QRCODE:
      return `/events/${perceptorNameByStep(step)}`
    case PipelineStep.CALLBACK:
      return `/events/${perceptorNameByStep(step)}`
    default:
      return ''
  }
}

export const PipelineContext = React.createContext(defaultValue)
export const usePipeline: () => Pipeline = () => React.useContext(PipelineContext)

export const PipelineProvider: React.FC<PipelineProps> = ({ setShowDetails, children }) => {
  const [imageSrc, setImageSrc] = React.useState < string >(liveFeedSrc)
  const [selectedStep, setSelectedStep] = React.useState<PipelineStep | undefined>(undefined)
  const [hoveredStep, setHoveredStep] = React.useState<PipelineStep | undefined>(undefined)
  const [summary, setSummary] = React.useState<SummaryState>(defaultSummaryState)
  const [latestPulse, setLatestPulse] = React.useState<Pulse | undefined>(undefined)
  const [events, setEvents] = React.useState<EventItem[]>([])
  let [config, setConfig] = React.useState<ConfigItem[]>([])
  const isPlaying = React.useMemo(() => !imageSrc.includes('base64'), [imageSrc])
  const { pushErrorFeedBack } = useFeedback()

  const fetchEvents = async (): Promise<void> => {
    if (selectedStep === undefined || stepEventURL(selectedStep) === '') {
      setEvents([])
      return
    }
    try {
      const res = await window.fetch(`${stepEventURL(selectedStep)}`)
      if (!res.ok) { throw new Error(res.statusText) }
      const data = await res.json()
      setEvents(data)
    } catch (e: any) {
      console.error(e)
      pushErrorFeedBack(e)
    }
  }

  async function fetchPerceptorConfig (step: PipelineStep): Promise<void> {
    const url = stepConfigURL(step)
    if (url === '') {
      setConfig([])
      return
    }
    const res = await window.fetch(`/pipeline${url}`)
    if (!res.ok) { throw new Error(res.statusText) }
    const config = await res.json()
    setConfig(config)
  }

  async function pause (): Promise<void> {
    try {
      const res = await window.fetch('/current_pulse')
      if (!res.ok) { throw new Error(res.statusText) }
      const data = await res.json()
      setLatestPulse(data)
      if (data?.pom?.[perceptorNameByStep(PipelineStep.PEOPLE)]?.people_count != null) {
        setSummary(summary => ({ ...summary, inScene: data.pom[perceptorNameByStep(PipelineStep.PEOPLE)].people_count }))
      }
      setImageSrc(data.frame)
    } catch (e: any) {
      console.error(e)
      pushErrorFeedBack(e)
    }
  }

  React.useEffect(() => {
    if (selectedStep !== undefined) {
      fetchPerceptorConfig(selectedStep)
        .catch(err => {
          console.error(err)
          pushErrorFeedBack(err)
          setConfig([])
        })
      fetchEvents()
        .catch(err => {
          console.error(err)
          pushErrorFeedBack(err)
          setEvents([])
        })
    }
  }, [selectedStep])

  const saveConfig = async (): Promise<void> => {
    if (selectedStep === undefined) return
    try {
      const url = stepConfigURL(selectedStep)
      if (url === '') {
        return
      }
      const res = await window.fetch(`/pipeline${url}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config.reduce((acc: any, item: ConfigItem) => {
          acc[item.name] = item.value
          return acc
        }, {}))
      })
      if (!res.ok) {
        throw new Error(`Failed to save config:\n ${res.statusText}`)
      }
    } catch (e: any) {
      console.error(e)
      pushErrorFeedBack(e)
      void fetchPerceptorConfig(selectedStep)
    }
  }

  const updateConfig = (item: ConfigItem, newValue: any): void => {
    const newConfig = config.map(i => {
      if (i.name === item.name) {
        const value = item.type === 'int' || item.type === 'float' ? Number(newValue) : newValue
        return { ...i, value }
      }
      return i
    })
    setConfig(newConfig)
    config = newConfig // This will update the value on config in case saveConfig is called before the state update happens
    // saveConfig(newConfig)
    //   ?.catch(err => console.error(err))
  }

  async function fetchSummary (): Promise<void> {
    if (!isPlaying) { return }
    try {
      const res = await fetch('/events/summary')
      if (!res.ok) {
        throw new Error(res.statusText)
      }
      setSummary(await res.json())
    } catch (err: any) {
      pushErrorFeedBack(err)
      setSummary(defaultSummaryState)
    }
  }

  return (
    <PipelineContext.Provider
      value={{
        events,
        isPlaying,
        latestPulse,
        config,
        imageSrc,
        selectedStep,
        hoveredStep,
        summary,
        fetchSummary,
        selectStep: (step?: PipelineStep) => { setSelectedStep(step); setShowDetails(true) },
        hoverStep: (step?: PipelineStep) => setHoveredStep(step),
        playLiveStream: () => { setImageSrc(liveFeedSrc) },
        pauseLiveStream: pause,
        fetchEvents: async () => await fetchEvents(),
        showFrame: (frame: string) => setImageSrc(frame),
        updateConfig,
        saveConfig
      }}
    >
      {children}
    </PipelineContext.Provider>
  )
}
