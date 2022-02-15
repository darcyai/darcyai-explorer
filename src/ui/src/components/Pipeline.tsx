import React from 'react'
import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material'
import { usePipeline, PipelineStep } from '../providers/Pipeline'
import clsx from 'clsx'

const useStyles = makeStyles((theme: Theme) => {
  return {
    step: {
      cursor: 'pointer',
      '&:hover, &.selected': {
        '& rect': {
          stroke: theme.palette.neutral[0]
        },
        '& circle, & text, & #blue_base': {
          fill: theme.palette.neutral[0]
        }
      }
    }
  }
})

const PipelineSVG: React.FC = () => {
  const { selectedStep, selectStep, hoverStep } = usePipeline()
  const classes = useStyles()

  const stepProps = (step: PipelineStep): {} => ({
    onMouseEnter: () => hoverStep(step),
    onMouseLeave: () => hoverStep(),
    className: clsx(classes.step, selectedStep === step && 'selected'),
    onClick: () => selectStep(step)
  })

  return (
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 953.688 119.999'>
      <g id='node_graph' data-name='node graph' transform='translate(-23.074 -100.5)'>
        <g id='node-IS' transform='translate(23.574 143)' {...stepProps(PipelineStep.INPUT)}>
          <rect id='outline' width='120.77' height='33.999' rx='2' fill='transparent' stroke='#5ac8fa' strokeWidth='1' />
          <path id='blue_base' data-name='blue base' d='M2,0H34a0,0,0,0,1,0,0V34a0,0,0,0,1,0,0H2a2,2,0,0,1-2-2V2A2,2,0,0,1,2,0Z' fill='#5ac8fa' />
          <text
            id='Input_Stream' data-name='Input
    Stream' transform='translate(38.116 15)' fill='#5ac8fa' stroke='rgba(0,0,0,0)' strokeWidth='1' fontSize='12' fontFamily='Gilroy-Medium, Gilroy' fontWeight='500' letterSpacing='-0.005em'
          ><tspan x='0' y='0'>INPUT</tspan><tspan x='0' y='12'>STREAM</tspan>
          </text>
          <g id='ball_right' data-name='ball right' transform='translate(117.653 14)' fill='#5ac8fa' stroke='#0a415e' strokeWidth='1'>
            <circle cx='3.5' cy='3.5' r='3.5' stroke='none' />
            <circle cx='3.5' cy='3.5' r='3' fill='none' />
          </g>
          <g id='icon-IS' transform='translate(0.116)'>
            <g id='Group_1393' data-name='Group 1393'>
              <path id='Rectangle_274' data-name='Rectangle 274' d='M7,0H34a0,0,0,0,1,0,0V34a0,0,0,0,1,0,0H7a7,7,0,0,1-7-7V7A7,7,0,0,1,7,0Z' fill='none' />
            </g>
            <path id='Union_16' data-name='Union 16' d='M10.719,14.276a.745.745,0,0,1,0-1.057l5.969-5.973L10.719,1.278a.751.751,0,0,1,0-1.062.759.759,0,0,1,1.063,0l6.5,6.5a.754.754,0,0,1,0,1.063l-6.5,6.5a.75.75,0,0,1-1.062,0ZM.754,11a.751.751,0,1,1,0-1.5h10.5a.751.751,0,0,1,0,1.5Zm2-3a.751.751,0,0,1,0-1.5h11a.751.751,0,0,1,0,1.5Zm-2-3a.751.751,0,1,1,0-1.5h10.5a.751.751,0,0,1,0,1.5Z' transform='translate(8.248 10.251)' fill='#0a415e' />
          </g>
        </g>
        <g id='node-MP' transform='translate(430.631 101)' {...stepProps(PipelineStep.MASK)}>
          <rect id='outline-2' data-name='outline' width='120.978' height='33.999' rx='2' transform='translate(3.884)' fill='transparent' stroke='#5ac8fa' strokeWidth='1' />
          <path id='blue_base' data-name='blue base' d='M2,0H34a0,0,0,0,1,0,0V34a0,0,0,0,1,0,0H2a2,2,0,0,1-2-2V2A2,2,0,0,1,2,0Z' transform='translate(3.884)' fill='#5ac8fa' />
          <text
            id='Mask_Perceptor' data-name='Mask
    Perceptor' transform='translate(42 15)' fill='#5ac8fa' stroke='rgba(0,0,0,0)' strokeWidth='1' fontSize='12' fontFamily='Gilroy-Medium, Gilroy' fontWeight='500' letterSpacing='-0.005em'
          ><tspan x='0' y='0'>MASK</tspan><tspan x='0' y='12'>PERCEPTOR</tspan>
          </text>
          <g id='ball_right-2' data-name='ball right' transform='translate(122 14)' fill='#5ac8fa' stroke='#0a415e' strokeWidth='1'>
            <circle cx='3.5' cy='3.5' r='3.5' stroke='none' />
            <circle cx='3.5' cy='3.5' r='3' fill='none' />
          </g>
          <g id='ball_left' data-name='ball left' transform='translate(0 14)' fill='#5ac8fa' stroke='#0a415e' strokeWidth='1'>
            <circle cx='3.5' cy='3.5' r='3.5' stroke='none' />
            <circle cx='3.5' cy='3.5' r='3' fill='none' />
          </g>
          <g id='icon-mask' transform='translate(4)'>
            <path id='Rectangle_274-2' data-name='Rectangle 274' d='M7,0H34a0,0,0,0,1,0,0V34a0,0,0,0,1,0,0H7a7,7,0,0,1-7-7V7A7,7,0,0,1,7,0Z' transform='translate(0)' fill='none' />
            <g id='Production' transform='translate(5 10)'>
              <path id='icon-scan-mask' d='M18.562.594A3.143,3.143,0,0,1,21.7,3.6,3.606,3.606,0,0,1,24.517,7.21,3.606,3.606,0,0,1,21.7,10.816a3.143,3.143,0,0,1-3.14,3.01H7.66a3.143,3.143,0,0,1-3.134-2.911C2.478,10.368,1.375,9.1,1.375,7.21S2.478,4.051,4.526,3.5A3.143,3.143,0,0,1,7.66.594h10.9Zm0,1.654H7.66A1.489,1.489,0,0,0,6.172,3.736h0v6.947A1.489,1.489,0,0,0,7.66,12.172h10.9a1.489,1.489,0,0,0,1.489-1.489h0V3.736a1.489,1.489,0,0,0-1.489-1.489ZM2.7,7.21A2.287,2.287,0,0,0,4.518,9.533V4.887A2.287,2.287,0,0,0,2.7,7.21ZM21.7,5.013V9.407a2.2,2.2,0,0,0,1.489-2.2A2.2,2.2,0,0,0,21.7,5.013ZM16.916,8.083A.662.662,0,0,1,16.965,9.4l-.049,0H9.307a.662.662,0,0,1-.049-1.321l.049,0Zm0-2.977a.662.662,0,0,1,.049,1.321l-.049,0H9.307a.662.662,0,0,1-.049-1.321l.049,0Z' transform='translate(-1.375 -0.594)' fill='#0a415e' />
            </g>
          </g>
        </g>
        <g id='node-QP' transform='translate(430.631 186)' {...stepProps(PipelineStep.QRCODE)}>
          <rect id='outline-3' data-name='outline' width='121.331' height='33.999' rx='2' transform='translate(3.884)' fill='transparent' stroke='#5ac8fa' strokeWidth='1' />
          <path id='blue_base' data-name='blue base' d='M2,0H34a0,0,0,0,1,0,0V34a0,0,0,0,1,0,0H2a2,2,0,0,1-2-2V2A2,2,0,0,1,2,0Z' transform='translate(3.884)' fill='#5ac8fa' />
          <text
            id='QR_CODE_Perceptor' data-name='QR CODE
    Perceptor' transform='translate(42 15)' fill='#5ac8fa' stroke='rgba(0,0,0,0)' strokeWidth='1' fontSize='12' fontFamily='Gilroy-Medium, Gilroy' fontWeight='500' letterSpacing='-0.005em'
          ><tspan x='0' y='0'>QR CODE</tspan><tspan x='0' y='12'>PERCEPTOR</tspan>
          </text>
          <g id='ball_right-3' data-name='ball right' transform='translate(123 14)' fill='#5ac8fa' stroke='#0a415e' strokeWidth='1'>
            <circle cx='3.5' cy='3.5' r='3.5' stroke='none' />
            <circle cx='3.5' cy='3.5' r='3' fill='none' />
          </g>
          <g id='ball_left-2' data-name='ball left' transform='translate(0 14)' fill='#5ac8fa' stroke='#0a415e' strokeWidth='1'>
            <circle cx='3.5' cy='3.5' r='3.5' stroke='none' />
            <circle cx='3.5' cy='3.5' r='3' fill='none' />
          </g>
          <g id='icon-QR' transform='translate(4)'>
            <path id='Rectangle_274-3' data-name='Rectangle 274' d='M7,0H34a0,0,0,0,1,0,0V34a0,0,0,0,1,0,0H7a7,7,0,0,1-7-7V7A7,7,0,0,1,7,0Z' transform='translate(0)' fill='none' />
            <path id='icon-scan-pass' d='M17.128,9.057A1.758,1.758,0,0,0,19.1,7.038V2.432A1.751,1.751,0,0,0,17.128.423H12.441a1.754,1.754,0,0,0-1.978,2.009V7.038a1.761,1.761,0,0,0,1.978,2.019Zm-10.333,0A1.758,1.758,0,0,0,8.763,7.038V2.432A1.751,1.751,0,0,0,6.795.423H2.1A1.751,1.751,0,0,0,.129,2.432V7.038A1.758,1.758,0,0,0,2.1,9.057ZM6.764,7.6H2.118c-.361,0-.536-.185-.536-.567V2.432c0-.371.175-.556.536-.556H6.764a.489.489,0,0,1,.546.556V7.038C7.31,7.419,7.125,7.6,6.764,7.6Zm10.344,0H12.461c-.371,0-.546-.185-.546-.567V2.432a.485.485,0,0,1,.546-.556h4.646c.361,0,.536.185.536.556V7.038C17.644,7.419,17.468,7.6,17.108,7.6ZM5.322,5.822c.144,0,.206-.062.206-.237V3.875c0-.165-.062-.227-.206-.227H3.56c-.155,0-.206.062-.206.227v1.71c0,.175.052.237.206.237Zm10.4,0c.155,0,.216-.062.216-.237V3.875c0-.165-.062-.227-.216-.227H13.955c-.144,0-.2.062-.2.227v1.71c0,.175.052.237.2.237ZM6.795,19.39a1.751,1.751,0,0,0,1.968-2.009V12.766a1.755,1.755,0,0,0-1.968-2.009H2.1A1.755,1.755,0,0,0,.129,12.766v4.616A1.751,1.751,0,0,0,2.1,19.39Zm6.13-5.965c.144,0,.206-.062.206-.237v-1.71c0-.165-.062-.227-.206-.227H11.163c-.155,0-.206.062-.206.227v1.71c0,.175.052.237.206.237Zm5.471,0c.144,0,.206-.062.206-.237v-1.71c0-.165-.062-.227-.206-.227H16.634c-.155,0-.206.062-.206.227v1.71c0,.175.052.237.206.237ZM6.764,17.938H2.118c-.361,0-.536-.185-.536-.556V12.776c0-.381.175-.567.536-.567H6.764c.361,0,.546.185.546.567v4.605A.489.489,0,0,1,6.764,17.938ZM5.322,16.166c.144,0,.206-.062.206-.247v-1.7c0-.165-.062-.227-.206-.227H3.56c-.155,0-.206.062-.206.227v1.7c0,.185.052.247.206.247Zm10.364,0c.144,0,.206-.062.206-.247v-1.7c0-.165-.062-.227-.206-.227H13.924c-.155,0-.206.062-.206.227v1.7c0,.185.052.247.206.247ZM12.925,18.9c.144,0,.206-.062.206-.237v-1.71c0-.165-.062-.227-.206-.227H11.163c-.155,0-.206.062-.206.227v1.71c0,.175.052.237.206.237Zm5.471,0c.144,0,.206-.062.206-.237v-1.71c0-.165-.062-.227-.206-.227H16.634c-.155,0-.206.062-.206.227v1.71c0,.175.052.237.206.237Z' transform='translate(7.871 7.577)' fill='#0a415e' />
          </g>
        </g>
        <g id='node-CB' transform='translate(645.631 143)' {...stepProps(PipelineStep.CALLBACK)}>
          <rect id='outline-4' data-name='outline' width='120.978' height='33.999' rx='2' transform='translate(3.884)' fill='transparent' stroke='#5ac8fa' strokeWidth='1' />
          <path id='blue_base' data-name='blue base' d='M2,0H34a0,0,0,0,1,0,0V34a0,0,0,0,1,0,0H2a2,2,0,0,1-2-2V2A2,2,0,0,1,2,0Z' transform='translate(3.884)' fill='#5ac8fa' />
          <text id='CALLBACK' transform='translate(42 21)' fill='#5ac8fa' stroke='rgba(0,0,0,0)' strokeWidth='1' fontSize='12' fontFamily='Gilroy-Medium, Gilroy' fontWeight='500' letterSpacing='-0.005em'><tspan x='0' y='0'>CALLBACK</tspan></text>
          <g id='ball_right-4' data-name='ball right' transform='translate(122 14)' fill='#5ac8fa' stroke='#0a415e' strokeWidth='1'>
            <circle cx='3.5' cy='3.5' r='3.5' stroke='none' />
            <circle cx='3.5' cy='3.5' r='3' fill='none' />
          </g>
          <g id='ball_left-3' data-name='ball left' transform='translate(0 14)' fill='#5ac8fa' stroke='#0a415e' strokeWidth='1'>
            <circle cx='3.5' cy='3.5' r='3.5' stroke='none' />
            <circle cx='3.5' cy='3.5' r='3' fill='none' />
          </g>
          <g id='icon-CB' transform='translate(4)'>
            <path id='Rectangle_274-4' data-name='Rectangle 274' d='M7,0H34a0,0,0,0,1,0,0V34a0,0,0,0,1,0,0H7a7,7,0,0,1-7-7V7A7,7,0,0,1,7,0Z' transform='translate(0)' fill='none' />
            <path id='Path_566' data-name='Path 566' d='M18.709,9.354A9.354,9.354,0,0,0,0,9.354a.75.75,0,0,0,1.5,0,7.854,7.854,0,1,1,7.855,7.854h-2.3l3.2-3.2a.75.75,0,0,0-1.061-1.06L4.183,17.958,8.9,22.67a.75.75,0,0,0,1.06-1.06l-2.9-2.9h2.3a9.365,9.365,0,0,0,9.354-9.354' transform='translate(8 7)' fill='#0a415e' />
          </g>
        </g>
        <g id='node-OS' transform='translate(851.608 143)' {...stepProps(PipelineStep.OUTPUT)}>
          <rect id='outline-5' data-name='outline' width='120.77' height='33.999' rx='2' transform='translate(3.884)' fill='transparent' stroke='#5ac8fa' strokeWidth='1' />
          <path id='blue_base' data-name='blue base' d='M2,0H34a0,0,0,0,1,0,0V34a0,0,0,0,1,0,0H2a2,2,0,0,1-2-2V2A2,2,0,0,1,2,0Z' transform='translate(3.884)' fill='#5ac8fa' />
          <text
            id='Output_Stream' data-name='Output
    Stream' transform='translate(43.023 15)' fill='#5ac8fa' stroke='rgba(0,0,0,0)' strokeWidth='1' fontSize='12' fontFamily='Gilroy-Medium, Gilroy' fontWeight='500' letterSpacing='-0.005em'
          ><tspan x='0' y='0'>OUTPUT</tspan><tspan x='0' y='12'>STREAM</tspan>
          </text>
          <g id='ball_left-4' data-name='ball left' transform='translate(1.024 14)' fill='#5ac8fa' stroke='#0a415e' strokeWidth='1'>
            <circle cx='3.5' cy='3.5' r='3.5' stroke='none' />
            <circle cx='3.5' cy='3.5' r='3' fill='none' />
          </g>
          <g id='icon-OS' transform='translate(5.024)'>
            <path id='Rectangle_274-5' data-name='Rectangle 274' d='M7,0H34a0,0,0,0,1,0,0V34a0,0,0,0,1,0,0H7a7,7,0,0,1-7-7V7A7,7,0,0,1,7,0Z' transform='translate(0)' fill='none' />
            <path id='Union_15' data-name='Union 15' d='M10.222,14.279a.747.747,0,0,1,0-1.059L16.187,7.25,10.222,1.283A.75.75,0,0,1,11.28.22l6.5,6.5a.751.751,0,0,1,0,1.063l-6.5,6.5a.747.747,0,0,1-1.059,0Zm-5,0a.747.747,0,0,1,0-1.059L11.187,7.25,5.22,1.283A.75.75,0,0,1,6.278.22l6.5,6.5a.756.756,0,0,1,0,1.063l-6.5,6.5a.741.741,0,0,1-.525.22A.748.748,0,0,1,5.22,14.279Zm-5,0a.747.747,0,0,1,0-1.059L6.187,7.25.22,1.283A.75.75,0,0,1,1.278.22l6.5,6.5a.756.756,0,0,1,0,1.063l-6.5,6.5a.747.747,0,0,1-1.059,0Z' transform='translate(8.249 10.249)' fill='#0a415e' />
          </g>
        </g>
        <g id='connectors' transform='translate(141.889 118.5)'>
          <path id='Path_693' data-name='Path 693' d='M-17933.049,7805.512c-52.57,0-43.414-41.845-86.623-41.66' transform='translate(18440.016 -7763.172)' fill='none' stroke='#5ac8fa' strokeWidth='1' strokeDasharray='1 2' />
          <path id='Path_696' data-name='Path 696' d='M-18019.676,7805.512c52.578,0,43.416-41.845,86.627-41.66' transform='translate(18225.676 -7763.172)' fill='none' stroke='#5ac8fa' strokeWidth='1' strokeDasharray='1 2' />
          <path id='Path_694' data-name='Path 694' d='M-18019.676,7805.512c-52.578,0,-43.416-41.845,-86.627-41.66' transform='translate(18320.676 -7720.172)' fill='none' stroke='#5ac8fa' strokeWidth='1' strokeDasharray='1 2' />
          <path id='Path_695' data-name='Path 695' d='M-18019.676,7805.512c52.578,0,43.416-41.845,86.627-41.66' transform='translate(18435.676 -7720.172)' fill='none' stroke='#5ac8fa' strokeWidth='1' strokeDasharray='1 2' />
          <line id='Line_128' data-name='Line 128' x2='78.177' transform='translate(10, 42.34)' fill='none' stroke='#5ac8fa' strokeWidth='1' strokeDasharray='1 2' />
          <line id='Line_129' data-name='Line 129' x2='78.177' transform='translate(631.838 42.34)' fill='none' stroke='#5ac8fa' strokeWidth='1' strokeDasharray='1 2' />
        </g>
        <g id='node-PP' transform='translate(223.631 143)' {...stepProps(PipelineStep.PEOPLE)}>
          <rect id='outline-6' data-name='outline' width='121.578' height='33.999' rx='2' transform='translate(3.883)' fill='transparent' stroke='#5ac8fa' strokeWidth='1' />
          <path id='blue_base' data-name='blue base' d='M2,0H34a0,0,0,0,1,0,0V34a0,0,0,0,1,0,0H2a2,2,0,0,1-2-2V2A2,2,0,0,1,2,0Z' transform='translate(3.883)' fill='#5ac8fa' />
          <text
            id='People_Perceptor' data-name='People
    Perceptor' transform='translate(42 15)' fill='#5ac8fa' stroke='rgba(0,0,0,0)' strokeWidth='1' fontSize='12' fontFamily='Gilroy-Medium, Gilroy' fontWeight='500' letterSpacing='-0.005em'
          ><tspan x='0' y='0'>PEOPLE</tspan><tspan x='0' y='12'>PERCEPTOR</tspan>
          </text>
          <g id='ball_right-5' data-name='ball right' transform='translate(123 14)' fill='#5ac8fa' stroke='#0a415e' strokeWidth='1'>
            <circle cx='3.5' cy='3.5' r='3.5' stroke='none' />
            <circle cx='3.5' cy='3.5' r='3' fill='none' />
          </g>
          <g id='ball_left-5' data-name='ball left' transform='translate(0 14)' fill='#5ac8fa' stroke='#0a415e' strokeWidth='1'>
            <circle cx='3.5' cy='3.5' r='3.5' stroke='none' />
            <circle cx='3.5' cy='3.5' r='3' fill='none' />
          </g>
          <g id='icon-PP' transform='translate(4)'>
            <path id='Rectangle_274-6' data-name='Rectangle 274' d='M7,0H34a0,0,0,0,1,0,0V34a0,0,0,0,1,0,0H7a7,7,0,0,1-7-7V7A7,7,0,0,1,7,0Z' fill='none' />
            <g id='Union_13' data-name='Union 13' transform='translate(13 5)' fill='none'>
              <path d='M2.959,23.315a1.132,1.132,0,0,1-1.134-1.131V14.446H1.468A1.469,1.469,0,0,1,0,12.979V7.67A1.47,1.47,0,0,1,1.471,6.2h4.7A1.469,1.469,0,0,1,7.638,7.67v5.309A1.469,1.469,0,0,1,6.17,14.446H5.813v7.738a1.132,1.132,0,0,1-1.131,1.131ZM1.532,2.29A2.289,2.289,0,1,1,3.819,4.577,2.289,2.289,0,0,1,1.532,2.29Z' stroke='none' />
              <path d='M 4.681151866912842 23.3154354095459 C 5.305661678314209 23.3154354095459 5.812501907348633 22.80859565734863 5.812501907348633 22.18457412719727 L 5.812501907348633 14.44628524780273 L 6.169921875 14.44628524780273 C 6.979981899261475 14.44628524780273 7.638181686401367 13.78808498382568 7.638181686401367 12.97851467132568 L 7.638181686401367 7.669924736022949 C 7.638181686401367 6.860354900360107 6.979981899261475 6.202144622802734 6.169921875 6.202144622802734 L 1.470701813697815 6.202144622802734 C 0.6582018136978149 6.202144622802734 1.796875039872248e-06 6.860354900360107 1.796875039872248e-06 7.669924736022949 L 1.796875039872248e-06 12.97851467132568 C 1.796875039872248e-06 13.78808498382568 0.6582018136978149 14.44628524780273 1.46826183795929 14.44628524780273 L 1.825681805610657 14.44628524780273 L 1.825681805610657 22.18457412719727 C 1.825681805610657 22.80859565734863 2.332521915435791 23.3154354095459 2.959471702575684 23.3154354095459 L 4.681151866912842 23.3154354095459 M 3.819331884384155 4.577144622802734 C 5.083981990814209 4.577144622802734 6.10889196395874 3.552734851837158 6.10889196395874 2.290034770965576 C 6.10889196395874 1.025394797325134 5.083981990814209 4.843750048166839e-06 3.819331884384155 4.843750048166839e-06 C 2.556641817092896 4.843750048166839e-06 1.531741738319397 1.025394797325134 1.531741738319397 2.290034770965576 C 1.531741738319397 3.552734851837158 2.556641817092896 4.577144622802734 3.819331884384155 4.577144622802734 M 4.681151866912842 24.8154354095459 L 2.959471702575684 24.8154354095459 C 1.507191777229309 24.8154354095459 0.3256818056106567 23.63523483276367 0.3256818056106567 22.18457412719727 L 0.3256818056106567 15.71761703491211 C -0.7455193400382996 15.26926803588867 -1.499998211860657 14.21033191680908 -1.499998211860657 12.97851467132568 L -1.499998211860657 7.669924736022949 C -1.499998211860657 6.213968753814697 -0.4451004862785339 4.999525547027588 0.9412351250648499 4.74935245513916 C 0.3744882643222809 4.087202548980713 0.03174179792404175 3.227847576141357 0.03174179792404175 2.290034770965576 C 0.03174179792404175 0.2002048492431641 1.730851769447327 -1.499995112419128 3.819331884384155 -1.499995112419128 C 5.908901691436768 -1.499995112419128 7.60889196395874 0.2002048492431641 7.60889196395874 2.290034770965576 C 7.60889196395874 3.227847576141357 7.265971183776855 4.087198734283447 6.698930263519287 4.749348640441895 C 8.084124565124512 4.999521732330322 9.138181686401367 6.213968753814697 9.138181686401367 7.669924736022949 L 9.138181686401367 12.97851467132568 C 9.138181686401367 14.21033191680908 8.383703231811523 15.26926803588867 7.312501907348633 15.71761703491211 L 7.312501907348633 22.18457412719727 C 7.312501907348633 23.63523483276367 6.132081985473633 24.8154354095459 4.681151866912842 24.8154354095459 Z' stroke='none' fill='#0a415e' />
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}

export default PipelineSVG
