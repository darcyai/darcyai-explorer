import { Theme } from '@mui/material'

const sharedStyles: (theme: Theme) => any = (theme: Theme) => ({
  iconColor: {
    '& path, & circle': {
      fill: `var(--svg-color, ${theme.palette.neutral[2] as string})!important`
    },
    '& line': {
      stroke: `var(--svg-color, ${theme.palette.neutral[2] as string})!important`
    }
  },
  actionIcon: {
    '--svg-color': theme.palette.primary.main,
    '&:hover': {
      '--svg-color': theme.palette.neutral[0],
      cursor: 'pointer'
    }
  },
})

export default sharedStyles