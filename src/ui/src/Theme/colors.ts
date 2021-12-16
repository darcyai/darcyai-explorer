import { EdgeColors } from './types'

const neutral = ['#ffffff', '#E3E8F1', '#A9B2BC', '#0A415E', '#012D44', '#002131']

const edgeColors: EdgeColors = {
  blue: '#5AC8FA',
  red: '#FD575D',
  green: '#1BC0A9',
  gold: '#EDAC40',
  neutral: neutral,
  text: {
    footer: neutral[2],
    default: neutral[0]
  },
  background: neutral[4],
  logo: '#ffffff'
}

export default edgeColors
