import React, { ReactElement } from 'react'

const liveFeedSrc = '/live_feed'

declare interface PipelineProps {
  setShowDetails: (v: boolean) => void
}

declare interface Pipeline {
  imageSrc: string
  pom: any
  selectedStep: PipelineStep | undefined
  hoveredStep: PipelineStep | undefined
  selectStep: (step?: PipelineStep) => void
  hoverStep: (step?: PipelineStep) => void
}

const defaultValue: Pipeline = {
  imageSrc: liveFeedSrc,
  pom: {},
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

export const PipelineContext = React.createContext(defaultValue)
export const usePipeline: () => Pipeline = () => React.useContext(PipelineContext)

export const PipelineProvider: React.FC<PipelineProps> = ({ setShowDetails, children }) => {
  const [imageSrc, setImageSrc] = React.useState < string > (liveFeedSrc)
  const [selectedStep, setSelectedStep] = React.useState<PipelineStep | undefined>(undefined)
  const [hoveredStep, setHoveredStep] = React.useState<PipelineStep | undefined>(PipelineStep.INPUT)
  const [pom, setPOM] = React.useState<any>({})


  async function fetchFrame () {
    const res = await window.fetch('http://localhost:5000/pulse/1')
    const data = await res.json()
    setImageSrc('data:image/jpeg;base64,' + data.data.frame)
    setPOM(data.pom)
  }

  return (
    <PipelineContext.Provider
      value={{
        pom,
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
