import React, { ReactElement } from 'react'

const liveFeedSrc = '/live_feed'

declare interface ConfigItem {
  default_value: any
  description: string
  name: string
  type: string
  value: any
}

declare interface PipelineProps {
  setShowDetails: (v: boolean) => void
}

declare interface Pipeline {
  imageSrc: string
  pom: any
  config: ConfigItem[]
  selectedStep: PipelineStep | undefined
  hoveredStep: PipelineStep | undefined
  selectStep: (step?: PipelineStep) => void
  hoverStep: (step?: PipelineStep) => void
}

const defaultValue: Pipeline = {
  imageSrc: liveFeedSrc,
  pom: {},
  config: [],
  selectedStep: undefined,
  hoveredStep: undefined,
  selectStep: (step?: PipelineStep) => {},
  hoverStep: (step?: PipelineStep) => {}
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
  const [pom, setPOM] = React.useState<any>({})
  const [config, setConfig] = React.useState<ConfigItem[]>([])

  async function fetchFrame () {
    const res = await window.fetch('/pulse/1')
    const data = await res.json()
    setImageSrc('data:image/jpeg;base64,' + data.data.frame)
    setPOM(data.pom)
  }

  async function fetchPerceptorConfig(step: PipelineStep) {
    const res = await window.fetch(`/pipeline/${stepConfigURL(step)}`)
    const config = await res.json()
    setConfig(config)
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
        pom,
        config,
        imageSrc,
        selectedStep,
        hoveredStep,
        selectStep: (step?: PipelineStep) => { setSelectedStep(step); setShowDetails(true) },
        hoverStep: (step?: PipelineStep) => setHoveredStep(step),
      }}
    >
      {children}
    </PipelineContext.Provider>
  )
}
