import React, { ReactElement } from 'react'

const liveFeedSrc = '/live_feed'

declare interface ConfigItem {
  default_value: any
  description: string
  name: string
  type: string
  value: any
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
  pulses: Pulse[]
  config: ConfigItem[]
  selectedStep: PipelineStep | undefined
  hoveredStep: PipelineStep | undefined
  selectStep: (step?: PipelineStep) => void
  hoverStep: (step?: PipelineStep) => void
  playLiveStream: () => void
  pauseLiveStream: () => void
  showFrame: (frame: string) => void
  fetchPulses: () => Promise<void>
}

const defaultValue: Pipeline = {
  imageSrc: liveFeedSrc,
  pulses: [],
  config: [],
  selectedStep: undefined,
  hoveredStep: undefined,
  selectStep: (step?: PipelineStep) => {},
  hoverStep: (step?: PipelineStep) => {},
  playLiveStream: () => {},
  pauseLiveStream: () => {},
  fetchPulses: async () => {},
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

const stepConfigURL: (step: PipelineStep) => string = (step: PipelineStep) => {
  switch (step) {
    case PipelineStep.INPUT:
      return '/perceptors/basic/config'
    case PipelineStep.PEOPLE:
      return '/perceptors/basic/config'
    case PipelineStep.MASK:
      return '/perceptors/basic/config'
    case PipelineStep.QRCODE:
      return '/perceptors/basic/config'
    case PipelineStep.CALLBACK:
      return '/perceptors/basic/config'
    case PipelineStep.OUTPUT:
      return '/perceptors/basic/config'
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
  const [config, setConfig] = React.useState<ConfigItem[]>([])

  async function fetchPulses () {
    try {
      const res = await window.fetch('/pulses/history')
      const data = await res.json()
      setPulses(data)
    } catch (e) {
      console.error(e)
    }
  }

  async function fetchPerceptorConfig(step: PipelineStep) {
    const res = await window.fetch(`/pipeline/${stepConfigURL(step)}`)
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
        showFrame: (frame: string) => setImageSrc(frame)
      }}
    >
      {children}
    </PipelineContext.Provider>
  )
}
