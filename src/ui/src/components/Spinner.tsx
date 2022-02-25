import { useTheme } from '@mui/styles'
import { Theme } from '@mui/material'
import React, { CSSProperties } from 'react'

interface CSSPropertiesWithVars extends CSSProperties {
  // Add a CSS Custom Property
  '--spinner-size'?: string
  '--spinner-color'?: string
}

export default function Spinner ({ size, color, className, style }: {size: number, color?: string, className?: string, style?: CSSProperties}): React.ReactElement {
  const theme: Theme = useTheme()
  const spinnerStyle: CSSPropertiesWithVars = { '--spinner-size': `${size}px`, '--spinner-color': color ?? theme.palette.primary.main }

  return (
    <div className={`${className ?? ''} custom-spinner`} style={{ ...style, ...spinnerStyle }} data-cy='Spinner'>
      <svg viewBox='0 0 120 120' version='1.1' xmlns='http://www.w3.org/2000/svg'>

        <symbol id='s--circle'>
          <circle r='10' cx='20' cy='20' />
        </symbol>,

        <g className='g-circles g-circles--v1'>
          <g className='g--circle'>
            <use href='#s--circle' className='u--circle' />
          </g>
          <g className='g--circle'>
            <use href='#s--circle' className='u--circle' />
          </g>
          <g className='g--circle'>
            <use href='#s--circle' className='u--circle' />
          </g>
          <g className='g--circle'>
            <use href='#s--circle' className='u--circle' />
          </g>
          <g className='g--circle'>
            <use href='#s--circle' className='u--circle' />
          </g>
          <g className='g--circle'>
            <use href='#s--circle' className='u--circle' />
          </g>
          <g className='g--circle'>
            <use href='#s--circle' className='u--circle' />
          </g>
          <g className='g--circle'>
            <use href='#s--circle' className='u--circle' />
          </g>
          <g className='g--circle'>
            <use href='#s--circle' className='u--circle' />
          </g>
          <g className='g--circle'>
            <use href='#s--circle' className='u--circle' />
          </g>
          <g className='g--circle'>
            <use href='#s--circle' className='u--circle' />
          </g>
          <g className='g--circle'>
            <use href='#s--circle' className='u--circle' />
          </g>
        </g>
      </svg>
    </div>
  )
}
